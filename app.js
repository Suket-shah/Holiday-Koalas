const { SSL_OP_LEGACY_SERVER_CONNECT } = require('constants');
const { REFUSED } = require('dns');
const express = require('express');
const upload = require('express-fileupload');
const path = require('path');
const { Connection, Request} = require('tedious');
const envio = require('dotenv').config();

// express config
const app = express();
const PORT = process.env.PORT || 5000;

// middlewear
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload());

// DB Connections
const config = {
    authentication: {
        options: {
          userName: process.env.SERVER_ADMIN_USER, // update me
          password: process.env.SERVER_PASSWORD
        },
        type: "default"
      },
      server: process.env.SERVER_NAME, 
      options: {
        database: process.env.DATABASE_NAME, 
        encrypt: true,
        rowCollectionOnDone: true
    }
}

function imgQuery(id) {
    return `SELECT baseimg FROM images WHERE frontendID=${id};`
}

function getImg(id) {
    const request = new Request(
        imgQuery(id),
        (err) => {
            if(err) {
                console.log(err);
            }
        }
    );
    connection.execSql(request);
    connection.close;
    return request;
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const connection = new Connection(config);

connection.on("connect", err => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('connection successful');
      let id = makeid(20);
      console.log(id);
    }
  });

app.get('/:id', (req, res) => {
    let result = getImg(req.params.id);
    result.on('doneInProc', async (rowCount, more, rows) => {
        if(rowCount === 0) {
            res.send("Defaults page");
        } else {
            // this is img
            console.log(rows[0][0].value);
            res.json(rows[0][0].value);
        }
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.post('/', (req, res) => {
    if(req.files) {
        console.log(req.files);
    }
})


app.listen(PORT, () => {
    console.log(
        `🚀 Server started in port ${PORT}`
    )
})