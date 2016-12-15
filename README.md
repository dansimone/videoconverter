# Video Converter

# Summary
* A service that lets a user upload large video files, converts them to a smaller size, then lets the user download the resulting files.
* Deployed to Google Container Engine.
* Consists of 2 services: a "UI" service and a "Processor" service.  Both are written in Node JS.  The UI Service uses the Node JS Meteor framework, which provides a smooth, reactive response of the UI.  The Processor service was broken out separately because the operations it performs are CPU-intensive, and so that we can easily scale up the Processor nodes to add compute power.
* UI service:
  * Meteor-based app.
  * Accepts uploads of video files.
  * Forwards them to the backend Processor nodes.
  * Displays a queue of pending/in progress/completed conversions, including visual progress of the conversions, as reported back by the Processor nodes.
  * Let's the user download the resulting converted movie files.
  * Uses a Mongo DB to store state.  This is currently using Meteor's _embedded_ Mongo instance, but a TODO is to deploy a separate Mongo DB as a backing service to the UI service (which will also allow multiple (stateless) UI services to exist simultaneously).
  * Scaled to 1 in the initial deployment.
* Processor service:
  * Regular Node JS-based app.
  * Accepts videos to be converted from the UI service.
  * Converts them using ffmpeg to a smaller (predefined) format.
  * Calls back to the UI service on progress of the conversions, and transfers the converted videos back to the UI service.
  * Scaled to 3 in the initial deployment.
 
# Problems
* Download links are not *fully* working yet.  They currently rely on talking to the backend Processor nodes via the LB only.  And each Processor node (currently) knows about only the converted files that *it* converted (need to fix this).  So the download link will currently return a 404 whenever the LB doesn't load balance to correct Processor node.

# Things that can be improved:
* Download links not fully implemented yet.  Still need to make the callback from Processor service to UI service with the converted video.
* Add more options for the type of file conversion performed, like specifying a bit rate, height, width, etc.  Currently, these settings are predefined in the Processor service logic.
* Split out Mongo DB as a separate backing service to the UI service.  Without this, scaling out the UI service isn't meaningful.
* Currently, to keep the converted videos around for a while (to allow the user to download them), the files are stored on the local file system of the UI service.  This should be moved to MongoDB as BLOBs, or external file storage.  Without this, scaling out the UI service isn't that meaningful, since not all converted videos are available to be downloaded from *any* UI node otherwise.
* Throttle Processor service so that it only handles X conversions at a time, and queues up the rest.
* Add logic to the UI node to restart conversions that have been abandoned by Processor nodes (for whatever reason, like a crash of the Processor node).

# Setup Steps
## Processor Service
 
    # Build Docker image
    cd processor-node
    docker build -t gcr.io/$PROJECT_ID/processor-node:0.5 .
    # Push image
    gcloud docker -- push gcr.io/$PROJECT_ID/processor-node:0.5
    # Deploy to GCE
    kubectl run processor-node --image=gcr.io/$PROJECT_ID/processor-node:0.5 --port=8080
    # Exposing processor-node as service allows the api-node deployment to refer
    # to the processor host as literally "process-node"
    kubectl expose deployment processor-node --type="LoadBalancer"
    # Scale up to give us more processing power
    kubectl scale deployment processor-node --replicas=3

## UI Service

    # Build Docker image
    cd processor-node
    meteor npm install tmp
    meteor # Need to have meteor installed locally
    docker build -t gcr.io/$PROJECT_ID/ui-node:0.5
    # Push image
    gcloud docker -- push gcr.io/$PROJECT_ID/ui-node:0.5
    # Deploy to GCE, referring to Processor service
    kubectl run ui-node --image=gcr.io/$PROJECT_ID/ui-node:0.5.5 --port=3000     --env=PROCESSOR_HOST=processor-node --env=PROCESSOR_PORT=8080
    # Expose external port
    kubectl expose deployment ui-node --type="LoadBalancer"
