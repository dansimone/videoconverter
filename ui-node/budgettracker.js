Videos = new Mongo.Collection("videos");
Categories = new Mongo.Collection("categories");
Transactions = new Mongo.Collection("transactions");

if (Meteor.isClient) {

  /**
   * Main Helpers
   */
  Template.main.helpers({
    getErrorClass: function (fieldName) {
      return getErrorClass(fieldName);
    }
  });
  Template.main.events({
  });
  Template.upload.events(
    {  // Clicking the Transaction table date column
      'click th.sort-dates': function () {
        var sortOrder = 1;
        if (Session.get('txnSortField') != null && Session.get('txnSortField').date != null) {
          sortOrder = Session.get('txnSortField').date * -1;
        }
        Session.set('txnSortField', {date: sortOrder});
      },
      // Clicking the Transaction table amount column
      "change .myFileInput": function(event, template) {
        var file = event.target.files[0];
        if (!file) return;

        videoId = Videos.insert({
          name: file.name,
          originalSize: 0, //getFileSizeString(fileObj.size()),
          status: "PENDING",
          percentComplete: 0
        });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/uploadToProcessor/' + videoId, true);
        xhr.onload = function(event){}
        xhr.send(file);

        event.target.value = null;
      }
    }
  );

  /**
   * Pending Videos Helpers
   */
  Template.pending.helpers({
    videos: function () {
      return Videos.find({status: "PENDING"}/*,{sort: Session.get('txnSortField')}*/);
    }
  });

  Template.pending.events({
    'click tr.video-row td a.video-remove': function () {
      event.preventDefault();
      var cell = $(event.target);
      var id = cell.closest('tr').attr("id");
      Videos.remove(id);
    }
  });

  /**
   * In Progress Videos Helpers
   */
  Template.inprogress.helpers({
    videos: function () {
      return Videos.find({status: "IN_PROGRESS"}/*,{sort: Session.get('txnSortField')}*/);
    },
    getPercentComplete: function () {
      return this.percentComplete;
    }
  });

  Template.inprogress.events({
    'click tr.video-row td a.video-remove': function () {
      event.preventDefault();
      var cell = $(event.target);
      var id = cell.closest('tr').attr("id");
      Videos.remove(id);
    }
  });

  /**
   * Completed Videos Helpers
   */
  Template.completed.helpers({
    videos: function () {
      return Videos.find({status: "COMPLETED"}/*,{sort: Session.get('txnSortField')}*/);
    }
  });

  Template.completed.events({
    'click tr.video-row td a.video-remove': function () {
      event.preventDefault();
      var cell = $(event.target);
      var id = cell.closest('tr').attr("id");
      Videos.remove(id);
      // TODO - remove local file as well
    }
  });
}

// On server startup, seed some sample data, if the DB is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    var http = Npm.require('http');
    var fs = Npm.require('fs');
    var tmp = Npm.require('tmp');

    // Create temporary directory
    var tmpDir = tmp.dirSync().name;
    console.log('Created tmp dir: ' + tmpDir);

    var localUrl = Meteor.absoluteUrl();
    console.log('Local URL is: ' + localUrl);

    // Configuration of REST API for Processor Node callbacks
    var Api = new Restivus({
      useDefaultAuth: true,
      prettyJson: true
    });
    //Api.addCollection(Videos);
    Api.addRoute('videos', {authRequired: false}, {
      get: function () {
        return Videos.find({}).fetch();
      },
      post: function () {
        if (this.queryParams.name == null) {
          return {statusCode: 400, message: 'Name not provided'}
        }
        // Insert the new video
        Videos.insert({
          name: this.queryParams.name,
          status: "PENDING",
          percentComplete: 0
        });
        return {statusCode: 200};
      }
    });
    Api.addRoute('videos/:id', {authRequired: false}, {
      get: function () {
        return Videos.findOne(this.urlParams.id);
      },
      put: function () {
        video = Videos.findOne(this.urlParams.id);
        if(video == null) {
          return {statusCode: 404,  message: 'Video not found'}
        }
        s = this.queryParams.status != null ? this.queryParams.status : video.status;
        p = this.queryParams.percentComplete != null ? this.queryParams.percentComplete : video.percentComplete;

        console.log("Updating with status: " + s + " " +  p);
        Videos.update({_id: video._id}, {$set: {status: s, percentComplete: p}});
        return {statusCode: 200};
        }
    });

    // Internal URL to send input files from client to server
    WebApp.connectHandlers.use('/uploadToProcessor',function(req,res){
      var parts = req.url.split("/");
      id = parts[1];
      console.log('Uploading file ' + id + ' to Processor Node');
      var start = Date.now()
      tmpFile = tmpDir +'/' + id;
      var file = fs.createWriteStream(tmpFile);

      file.on('error',function(error){
        console.log('Error ' + error);
      });
      file.on('finish',function(){
        res.writeHead(200)
        res.end();
        console.log('Finished uploading from client server, millis taken: ' + (Date.now() - start));

        //
        // Pass the file along to the processor
        //
        var options = {
          host: "localhost",
          port: 8080,
          path: '/convert?id=' + id + "&callbackUrl=" + localUrl,
          method: 'POST'
        };

        var req = http.request(options, function (res) {
          console.log('Processor request status: ' + res.statusCode);
        });
        // Read from the local file and stream to the processor node
        var readStream = fs.createReadStream(tmpFile);
        readStream.on('data', function (chunk) {
          req.write(chunk);
        }).on('end', function () {
          req.end();
          // Delete the tmp file - we don't need it anymore
          fs.unlink(tmpFile);
        });
      });

      req.pipe(file); // pipe the request to the file
    });
  });
}

/**
 * General Helper Functions.
 */
function getFileSizeString(bytes) {
  return (bytes / (1024*1024)).toFixed(2) + "MB";
}

function verifyEnvVar(name, value) {
  if (value == null) {
    throw ('Environment variable ' + name + ' must be set');
  }
  return value;
}