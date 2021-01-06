const { SSL_OP_LEGACY_SERVER_CONNECT } = require('constants');
const { REFUSED } = require('dns');
const express = require('express');
// const upload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const { Connection, Request} = require('tedious');
const envio = require('dotenv').config();

// express config
const app = express();
const PORT = process.env.PORT || 5000;

// middlewear
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());

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

let fileName;
// Storage Enginer Setup
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null,fileName);
    }
})

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 2000000},
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); // TODO THIS NEEDS TO BE UPLOADED ONCE WE FIGURE OUT THE FILE UPLOAD FORM NAME

// checks file type 
function checkFileType(file, cb) {
    // allowed extensions
    const filetypes = /jpeg|jpg|png/;
    // check extensions
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // check mime type
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Please Upload JPG, JPEG, or PNG types');
    }
}
function imgQuery(id) {
    return `SELECT baseimg FROM images WHERE frontendID='${id}';`
}

function uploadToDb(id, path) {
    return `INSERT INTO images (frontendID, baseimg) 
    VALUES ('${id}', '${path}');`
}

function uploadImg(id, path) {
    const request = new Request(
        uploadToDb(id, path),
        (err) => {
            if(err) {
                console.log(err);
            }
        }
    )
    connection.execSql(request);
    // might need to change this if you don't want to close the connection everytime
    connection.close;
    return request;
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
    // might want to change this if you don't want to close the conneciton everytime
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
    }
  });

app.get('/:id', (req, res) => {
    let result = getImg(req.params.id);
    result.on('doneInProc', async (rowCount, more, rows) => {
        if(rowCount === 0) {
            res.send("Defaults page");
        } else {
            console.log(rows[0][0].value);
            res.render(path.join(__dirname, '/index.ejs'), {data: 'uploads/' + rows[0][0].value});
        }
    })
})

app.get('/', (req, res) => {
    res.render(path.join(__dirname, '/index.ejs'), {
        data: 'astley.jpg',
        link: null
    });
})

app.post('/upload', (req, res) => {
    console.log(req.body.id);
    upload(req, res, (err) => {
        if(err) {
            res.json({status: 'failed'});
        } else {
            if(req.file == undefined) {
                res.json({status: 'failed'})
            } else {

                uploadImg(req.body.id, fileName);
                res.json({status: 'success'});
            }
        }
    })
})


app.listen(PORT, () => {
    console.log(
        `🚀 Server started in port ${PORT}`
    )
})