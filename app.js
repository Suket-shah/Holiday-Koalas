const express = require('express');
const glob = require('glob');
const path = require('path');
const envio = require('dotenv').config();

// express config
const app = express();
const PORT = process.env.PORT || 3000;

// middlewear
app.use( express.static(path.resolve('public')));
app.use(express.urlencoded());

glob.sync('./routes/*.js').forEach((file) => {
    console.log(file);
    app.use(require(path.resolve(file)));
});

// 404 Catch All
app.use((req, res, next) => {
    res.status(404).send('404 error has occured');
});

// 500 Catch All
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).send('500 error has occured');
});

app.listen(PORT)