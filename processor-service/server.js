var express = require('express');
var app = express();
var fs = require("fs");
var Ffmpeg = require('fluent-ffmpeg');
var streamBuffers = require('stream-buffers');
var randomstring = require("randomstring");
var tmp = require('tmp');
var http = require('http');
var url = require('url');

// Create temporary directory
var tmpDir = tmp.dirSync().name;
console.log('Created tmp dir: ' + tmpDir);

//
// Starts server
//
var server = app.listen(getValueOrDefault(process.env.PORT, 8080), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})

//
// Posts a video to convert
//
app.post('/convert', function (req, res) {
  id = req.param('id')
  if (id == null) {
    res.status(400).send("No id specified");
    return;
  }
  callbackUrl = req.param('callbackUrl')
  console.log("Converting video " + id);

  // Read input data to a local file - TODO - do this with streams instead
  preconvertedTmpFile = tmpDir + '/' + id;
  var size = 0;
  var wstream = fs.createWriteStream(preconvertedTmpFile);
  req.on('data', function (data) {
    size += data.length;
    wstream.write(data);
    //console.log('Got chunk: ' + data.length + ' total: ' + size);
  });
  req.on('end', function () {
    console.log("total size = " + size);
    wstream.end();
    // Trigger processing
    res.status(200);
    res.end();
    processVideo(preconvertedTmpFile, id, callbackUrl);
  });

  req.on('error', function (e) {
    console.log("ERROR: " + e.message);
  });
})

//
// Downloads a converted video
// TODO - this is temporary hack until I can get the callback to the UI working, with the
// data-binary.  That does *not* work easily with Meteor unfortunately.
//
app.get('/download/:name', function (req, res) {
  id = req.param('id')
  if (id == null) {
    res.status(400).send("No id specified");
    res.end();
    return;
  }
  convertedTmpFile = tmpDir + '/' + id + "-converted.mp4";
  if (!fs.existsSync(convertedTmpFile)) {
    res.status(404);
    res.end();
    return;
  }

  var readStream = fs.createReadStream(convertedTmpFile);
  readStream.on('data', function (chunk) {
    res.write(chunk);
  }).on('end', function () {
    res.end();
  });
})

//
// Main function to convert a video
//
function processVideo(localFile, id, callbackUrl) {
  convertedTmpFile = tmpDir + '/' + id + "-converted.mp4";
  var proc = new Ffmpeg()
    .input(localFile)
    .addOption('-crf', 23)
    .addOption('-c:v', 'libx264')
    .addOption('-preset veryfast')
    .addOption('-c:a', 'aac')
    .addOption('-b:a', '128k')
    .addOption('-movflags', '+faststart')
    .addOption('-vf', 'scale=-2:720,format=yuv420p')
    .on('start', function (commandLine) {
      console.log('**** SPAWN : ' + commandLine);
    })
    .on('progress', function (progress) {
      console.log('Processing ' + localFile + ' ' + progress.percent + '% done');
      callbackUIInProgress(id, callbackUrl, Math.round(progress.percent));
    })
    .on('error', function (err, stdout, stderr) {
      console.log('ERROR: ' + err.message);
      console.log('STDERR:' + stderr);
      // TODO - some kind of error handling here
    })
    .on('end', function () {
      console.log('Done processing: ' + localFile);
      callbackUICompleted(id, callbackUrl, getFileSizeString(convertedTmpFile));
      fs.unlink(localFile);

      // TODO - sometimes this line doesn't work if the video is very small (the tmpFile
      // doesn't register as existing for some reason)
      //fs.unlink(convertedTmpFile,function(err){
      //  if(err) {
      //    console.log('Error deleting converted file, continuing...');
      //  }
      //});
    })
    .saveToFile(convertedTmpFile);
}

//
// Calls back to UI with percent complete
//
function callbackUIInProgress(id, callbackUrl, percentComplete) {
  if(callbackUrl != null) {
    var callBackLocation = url.parse(callbackUrl, true, true);
    var options = {
      host: callBackLocation.hostname,
      port: callBackLocation.port,
      path: "/api/videos/" + id + "?status=IN_PROGRESS&percentComplete=" + percentComplete,
      method: 'PUT'
    };
    var req = http.request(options, function (res) {
      console.log('Callback status: ' + res.statusCode + " " + res.body);
      res.on('error', function (e) {
        console.log("ERROR: " + e.message);
      });
    }).end();
  }
}

//
// Call back to UI with completion message
//
function callbackUICompleted(id, callbackUrl, finalSize) {
  if(callbackUrl != null) {
    var callBackLocation = url.parse(callbackUrl, true, true);
    var options = {
      host: callBackLocation.hostname,
      port: callBackLocation.port,
      path: "/api/videos/" + id + "?status=COMPLETED&finalSize=" + finalSize,
      method: 'PUT'
    };
    var req = http.request(options, function (res) {
      console.log('Callback status: ' + res.statusCode + " " + res.body);
      res.on('error', function (e) {
        console.log("ERROR: " + e.message);
      });
    }).end();
  }
}

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}

function getFileSizeString(filename) {
  var stats = fs.statSync(filename)
  var bytes = stats["size"]
  return (bytes / (1024*1024)).toFixed(2) + "MB";
}