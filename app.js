const express = require('express');
const glob = require('glob');
const path = require('path');
const envio = require('dotenv').config();

// express config
const app = express();
const PORT = process.env.PORT || 80;

// middlewear
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());

glob.sync('./routes/*.js').forEach((file) => {
    console.log(file);
    app.use(require(path.resolve(file)));
});

app.listen(PORT)