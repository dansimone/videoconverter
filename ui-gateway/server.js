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

function getValueOrDefault(value, defaultValue) {
  return value != null ? value : defaultValue;
}