/**
 * Node JS server-side handling for ui-gateway frontend.
 */

var express = require('express');
var app = express();
var fs = require("fs");
var randomstring = require("randomstring");
app.use(express.static('./public'));

STORAGE_DIR = verifyEnvVar("STORAGE_DIR", process.env.STORAGE_DIR);

//
// Starts server
//
var server = app.listen(getValueOrDefault(process.env.PORT, 8080), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})

// Gets the list of all videos and their statuses
app.get('/videos', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  videos = [
    {id: "abc1", name: "Movie" + Math.random(), originalSize: "133MB", status: "PENDING"},
    {id: "abc2", name: "Movie" + Math.random(), originalSize: "133MB", status: "PENDING"},
    {id: "abc3", name: "Movie" + Math.random(), originalSize: "133MB", status: "IN_PROGRESS", percentComplete: 66},
    {id: "abc4", name: "Movie" + Math.random(), originalSize: "133MB", status: "IN_PROGRESS", percentComplete: 24},
    {id: "abc5", name: "Movie" + Math.random(), originalSize: "133MB", status: "IN_PROGRESS", percentComplete: 97},
    {id: "abc6", name: "Movie" + Math.random(), originalSize: "133MB", status: "IN_PROGRESS", percentComplete: 0},
    {
      id: "abc7",
      name: "Movie" + Math.random(),
      originalSize: "133MB",
      status: "COMPLETED",
      percentComplete: 100,
      finalSize: "88MB"
    },
    {
      id: "abc8",
      name: "Movie" + Math.random(),
      originalSize: "133MB",
      status: "COMPLETED",
      percentComplete: 100,
      finalSize: "78MB"
    },
    {
      id: "abc9",
      name: "Movie" + Math.random(),
      originalSize: "133MB",
      status: "COMPLETED",
      percentComplete: 100,
      finalSize: "43MB"
    }
  ];
  res.send(JSON.stringify(videos));
})

//
// Accepts a raw video from the client side, writes it to disk, then forwards it on
// for conversion.
//
app.post('/upload', function (req, res) {
  name = req.param('name')
  if (name == null) {
    res.status(400).send("No name specified");
    return;
  }

  // Save the raw file with a random id on disk
  rawFile = STORAGE_DIR + '/' + randomstring.generate(15);
  console.log("Saving " + name + " to disk as " + rawFile + "...");
  var size = 0;
  var wstream = fs.createWriteStream(rawFile);
  req.on('data', function (data) {
    size += data.length;
    wstream.write(data);
    //console.log('Got chunk: ' + data.length + ' total: ' + size);
  });
  req.on('end', function () {
    console.log("Done uploading");
    //console.log("total size = " + size);
    wstream.end();
    res.status(200);
    res.end();

    // TODO - send video off for conversion
  });

  req.on('error', function (e) {
    console.log("ERROR: " + e.message);
  });
})

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}

function verifyEnvVar(name, value) {
  if (value == null) {
    throw ('Environment variable ' + name + ' must be set');
  }
  return value;
}