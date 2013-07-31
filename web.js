var express = require('express');

var app = express();

var fs = require('fs');
var infile = "index.html";

buf = new Buffer(fs.readFileSync(infile));
var str = buf.toString();


app.get('/', function(request, response) {
  response.send(str);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
