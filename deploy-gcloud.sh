#!/usr/bin/env bash

PROJECT_ID="${PROJECT_ID:?Variable PROJECT_ID must be defined}"
PROJECT_VERSION="${PROJECT_VERSION:?Variable PROJECT_VERSION must be defined}"

#kubectl expose deployment api-node-mysql --type="LoadBalancer"

# Processor Service
kubectl run processor-service --image=gcr.io/$PROJECT_ID/processor-service:$PROJECT_VERSION \
  --port=8080
#kubectl scale deployment processor-node --replicas=3

# Catalog Service
kubectl run catalog-service --image=gcr.io/$PROJECT_ID/catalog-service:$PROJECT_VERSION --port=8080 \
  --env=DB_HOST=api-node-mysql --env=DB_PORT=3306 --env=DB_PW=welcome --env=PROCESSOR_HOST=processor-node \
   --env=PROCESSOR_PORT=8080
kubectl expose deployment catalog-service --type="LoadBalancer"

# UI Gateway
kubectl run ui-gateway --image=gcr.io/$PROJECT_ID/catalog-service:$PROJECT_VERSION --port=8080 \
  --env=DB_HOST=api-node-mysql --env=DB_PORT=3306 --env=DB_PW=welcome --env=PROCESSOR_HOST=processor-node \
  --env=PROCESSOR_PORT=8080
kubectl expose deployment ui-gateway --type="LoadBalancer"
