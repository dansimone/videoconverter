var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
var randomstring = require("randomstring");
var tmp = require('tmp');
var http = require('http');

dbHost = verifyEnvVar("DB_HOST", process.env.DB_HOST);
dbPort = verifyEnvVar("DB_PORT", process.env.DB_PORT);
db_pw = verifyEnvVar("DB_PW", process.env.DB_PW);
processorHost = verifyEnvVar("PROCESSOR_HOST", process.env.PROCESSOR_HOST);
processorPort = verifyEnvVar("PROCESSOR_PORT", process.env.PROCESSOR_PORT);

// Create temporary directory
var tmpDir = tmp.dirSync().name;
console.log('Created tmp dir: ' + tmpDir);

var connection = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: 'root',
  password: db_pw,
});
connection.connect();
connection.query('USE VIDEOCONVERTER');
connection.query('CREATE TABLE IF NOT EXISTS FILES (name VARCHAR(100), status VARCHAR(15), location VARCHAR(100),' +
  ' PRIMARY KEY (name))');

// User posts a video to convert
app.post('/file', function (req, res) {
  console.log("Converting video");

  fileName = req.param('name')
  if (fileName == null) {
    res.status(500).send("No file name specified");
    return;
  }
  console.log("Converting file: " + fileName);
  var post = {
    name: fileName, status: "IN_PROGRESS", location: ""
  };
  connection.query('INSERT INTO FILES SET ?', post, function (err, result) {
    if (err) {
      console.log('ERROR: ' + err);
      //res.status(500).send('ERROR: ' + err);
      //return;
    }
  });

  //
  // Read input data to a local file - TODO - do this with streams instead
  //
  tmpFile = tmpDir + '/' + fileName + ".mp4"
  var size = 0;
  var wstream = fs.createWriteStream(tmpFile);
  req.on('data', function (chunk) {
    size += chunk.length;
    wstream.write(chunk);
    console.log('Got chunk')
  });
  req.on('end', function () {
    console.log("Returning control");
    wstream.end();
    res.status(200);
    res.end();

    //
    // Pass the file along to the processor
    //
    var options = {
      host: processorHost,
      port: processorPort,
      path: '/convert?name=' + fileName,
      method: 'POST'
    };

    tmpFile1 = tmpDir + '/' + randomstring.generate(7) + '.mp4';
    var wstream1 = fs.createWriteStream(tmpFile1);
    console.log("Sending processor request with file: " + tmpFile);
    var req = http.request(options, function (res) {
      console.log('Processor request status: ' + res.statusCode);

      var size1 = 0;
      res.on('data', function (chunk) {
        //
        // Write processor's response to disk
        //
        size1 += chunk.length;
        wstream1.write(chunk);
        console.log('Got chunk1')
      });
      res.on('end', function () {
        wstream1.end();
        console.log('Writing processor response image to ' + tmpFile1);

        // Update DB
        location = tmpFile1.replace(/\\/g, '/');
        connection.query('UPDATE FILES SET status="COMPLETED", location="' + location +
          '"WHERE name="' + fileName + '"', function (err, result) {
          if (err) {
            console.log("ERROR: " + err);
          }
        });
      });
    });

    //
    // Read the tmp file and write chunks to the processor request
    //
    var readStream = fs.createReadStream(tmpFile);
    readStream.on('data', function (chunk) {
      req.write(chunk);
    }).on('end', function () {
      req.end();
    });
  });
})

// Updates the status of a video
app.post('/file', function (req, res) {
  console.log("Updating video status");

  fileName = req.param('name')
  if (fileName == null) {
    res.status(500).send("No file name specified");
    return;
  }
  status = req.param('status')
  if (status == null) {
    res.status(500).send("No status specified");
    return;
  }
  if (status != "NOT_STARTED" && status != "IN_PROGRESS" && status != "COMPLETED") {
    res.status(500).send("Invalid status specified");
    return;
  }

  console.log("Updating file: " + fileName);
  var post = {name: fileName, status: status};
  connection.query('UPDATE FILES SET status="' + status + '" WHERE name="' + fileName + '"', post, function (err, result) {
    if (err) {
      console.log("ERROR: " + err);
      res.sendStatus(500);
    }
    else {
      res.sendStatus(200);
    }
  });
})

// Gets the list of all videos that haven't started yet
app.get('/file', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  fileName = req.param('name')
  // Get all files
  if (fileName == null) {
    connection.query('SELECT * FROM FILES', function (err, rows, fields) {
      if (err) {
        console.log("ERROR: " + err);
        res.sendStatus(500);
      }
      else {
        for (var i in rows) {
          console.log('Post Titles: ', rows[i].name);
        }
        res.send(JSON.stringify(rows));
      }
    });
  }
  // Get just a specific file
  else {
    connection.query('SELECT * FROM FILES WHERE name="' + fileName + '"', function (err, rows, fields) {
      if (err) {
        console.log("ERROR: " + err);
        res.sendStatus(500);
      }
      else {
        if (rows.length == 0) {
          res.sendStatus(404);
        }
        else {
          res.send(JSON.stringify(rows[0]));
        }
      }
    });
  }
})

// Gets the list of all videos that haven't started yet
app.get('/file/download', function (req, res) {
  res.setHeader('Content-Type', 'application/json');

  fileName = req.param('name')
  if (fileName == null) {
    res.status(500).send("No file name specified");
    return;
  }

  connection.query('SELECT * FROM FILES WHERE name="' + fileName + '"', function (err, rows, fields) {
    if (err) {
      console.log("ERROR: " + err);
      res.sendStatus(500);
    }
    else {
      if (rows.length == 0) {
        res.sendStatus(404);
      }
      else {
        //
        // Read the file on disk and wrote chunks to the processor request
        //
        if (rows[0].status != "COMPLETED") {
          res.status(500).send('File conversion not yet completed');
        }
        else {
          location = rows[0].location;
          console.log("Sending video: " + location);

          var readStream = fs.createReadStream(location);
          readStream.on('data', function (chunk) {
            res.write(chunk);
          }).on('end', function () {
            res.end();
          });
        }
      }
    }
  });
})

var server = app.listen(getValueOrDefault(process.env.PORT, 8080), function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})

function verifyEnvVar(name, value) {
  if (value == null) {
    throw ('Environment variable ' + name + ' must be set');
  }
  return value;
}

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}