const express = require('express');
const app = express();

const host = 'localhost';
const port = 5500;

app.use(express.static(__dirname + '/audio'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/data'));
app.use(express.static(__dirname + '/font'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/js'));

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
