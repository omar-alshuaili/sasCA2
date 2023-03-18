const express = require('express');
const app = express();
const mime = require('mime-types');
// Use middleware to parse JSON request bodies
app.use(express.json());

const fetch = require('node-fetch');



//css
app.use(express.static(__dirname + '/'));

//html 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//js
app.get('*.js', (req, res) => {
    res.setHeader('Content-Type', mime.contentType('js'));
    res.sendFile(__dirname + req.path);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));