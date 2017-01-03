var express = require('express');
var app = express();
var fs = require("fs");

app.use(express.static('./public'));

//
// Starts server
//
var server = app.listen(getValueOrDefault(process.env.PORT, 8080), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})

// Gets the list of all videos that haven't started yet
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
// Posts a video to convert
//
app.post('/fileUpload', function (req, res) {
  id = req.param('id')
  //if (id == null) {
  //  res.status(400).send("No id specified");
  //  return;
  //}

  // Read input data to a local file
  id = 'foo123';
  preconvertedTmpFile = 'd:/tmp/' + id;
  console.log("Converting video " + preconvertedTmpFile);

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
  });

  req.on('error', function (e) {
    console.log("ERROR: " + e.message);
  });
})

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}