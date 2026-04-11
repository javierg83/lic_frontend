const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/dist/frontend/browser'));

app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname + '/dist/frontend/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
