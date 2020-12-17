const express = require('express');
const upload = require('express-fileupload');
const path = require('path');

// express config
const app = express();
const PORT = process.env.PORT || 5000;

// middlewear
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload());

app.get('/',  (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/', (req, res) => {
    if(req.files) {
        console.log(req.files);
    }
})

/*
CREATE TABLE images (
    ID uniqueidentifier NOT NULL
        DEFAULT newid(),
        */

app.listen(PORT, () => {
    console.log(
        `🚀 Server started in port ${PORT}`
    )
})