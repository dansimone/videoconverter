var express = require('express');
var app = express();
var fs = require("fs");
var Ffmpeg = require('fluent-ffmpeg');
var streamBuffers = require('stream-buffers');
var randomstring = require("randomstring");
var tmp = require('tmp');

// Create temporary directory
var tmpDir = tmp.dirSync().name;
console.log('Created tmp dir: ' + tmpDir);

// Posts a video to convert
app.post('/convert', function (req, res) {
  fileName = req.param('name')
  if (fileName == null) {
    res.status(500).send("No file name specified");
    return;
  }
  console.log("Converting video " + fileName);

  /*
   // start reading
   var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
   frequency: 10,   // in milliseconds.
   chunkSize: 2048  // in bytes.
   });
   */

  // Read input data to a local file - TODO - do this with streams instead
  tmpFile = tmpDir + '/' + fileName + ".mp4"
  var size = 0;
  var wstream = fs.createWriteStream(tmpFile);
  req.on('data', function (data) {
    size += data.length;
    wstream.write(data);
    //console.log('Got chunk: ' + data.length + ' total: ' + size);
  });
  req.on('end', function () {
    console.log("total size = " + size);
    wstream.end();
    // Trigger processing
    processVideo(tmpFile, res);
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

function processVideo(localFile, res) {
  tmpFile = tmpDir + '/' + randomstring.generate(7) + '.mp4';
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
    })
    .on('error', function (err, stdout, stderr) {
      console.log('ERROR: ' + err.message);
      console.log('STDERR:' + stderr);
      res.status(500).send('ERROR: ' + err.message + 'STDERR: ' + stderr);
    })
    .on('end', function () {
      console.log('Done processing: ' + localFile);
      res.status(200).sendFile(tmpFile);
      fs.unlink(localFile);
      // TODO - sometimes this line doesn't work if the video is very small (the tmpFile
      // doesn't register as existing for some reason)
      //fs.unlink(tmpFile);
    })
    .saveToFile(tmpFile);
}

function verifyEnvVar(name, value) {
  if (value == null) {
    throw ('Environment variable ' + name + ' must be set');
  }
  return value;
}

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}