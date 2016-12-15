var express = require('express');
var app = express();
var fs = require("fs");
var Ffmpeg = require('fluent-ffmpeg');
var streamBuffers = require('stream-buffers');
var randomstring = require("randomstring");
var tmp = require('tmp');
var http = require('http');

// Create temporary directory
var tmpDir = tmp.dirSync().name;
console.log('Created tmp dir: ' + tmpDir);

// Posts a video to convert
app.post('/convert', function (req, res) {
  id = req.param('id')
  if (id == null) {
    res.status(500).send("No id specified");
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

// Gets the list of all videos that haven't started yet
app.get('/jobs', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendStatus(200);
})

var server = app.listen(getValueOrDefault(process.env.PORT, 8080), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})

function processVideo(localFile, id, callbackUrl) {
  convertedTmpFile = tmpDir + '/' + id + "-converted.mp4";
  var proc = new Ffmpeg()
    .input(preconvertedTmpFile)
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
      console.log('Processing ' + preconvertedTmpFile + ' ' + progress.percent + '% done');
      callbackUIInProgress(id, callbackUrl, Math.round(progress.percent));
    })
    .on('error', function (err, stdout, stderr) {
      console.log('ERROR: ' + err.message);
      console.log('STDERR:' + stderr);
      // TODO - some kind of error handling here
    })
    .on('end', function () {
      console.log('Done processing: ' + preconvertedTmpFile);
      callbackUICompleted(id, callbackUrl);
      fs.unlink(preconvertedTmpFile);
      // TODO - sometimes this line doesn't work if the video is very small (the tmpFile
      // doesn't register as existing for some reason)
      fs.unlink(convertedTmpFile);
    })
    .saveToFile(convertedTmpFile);
}

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}

function callbackUIInProgress(id, callbackUrl, percentComplete) {
  var options = {
    host: "localhost",
    port: 3000,
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

function callbackUICompleted(id, callbackUrl) {
  var options = {
    host: "localhost",
    port: 3000,
    path: "/api/videos/" + id + "?status=COMPLETED",
    method: 'PUT'
  };
  var req = http.request(options, function (res) {
    console.log('Callback status: ' + res.statusCode + " " + res.body);
    res.on('error', function (e) {
      console.log("ERROR: " + e.message);
    });
  }).end();
}
