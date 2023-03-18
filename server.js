const express = require('express');
const app = express();
const mime = require('mime-types');
const mysql = require('mysql');
// Use middleware to parse JSON request bodies
app.use(express.json());

const fetch = require('node-fetch');



//css
app.use(express.static(__dirname + '/'));

//index  
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});
//login 
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/pages/login.html');
});

//signup 
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/pages/signup.html');
});

//js
app.get('*.js', (req, res) => {
    res.setHeader('Content-Type', mime.contentType('js'));
    res.sendFile(__dirname + req.path);
});


//log in 
app.post('/login'), (req, res) =>{
console.log("do log in")
}





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));