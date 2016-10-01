var express = require('express');
var app = express();
app.use(express.static('public'));

app.listen(8000, function() {
  console.log(`App is listening on port 8000.`);
});

app.get('/', function (req, res) {
  res.sendFile('public/index.html');
});