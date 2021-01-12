const multer = require('multer');
const path = require('path');
const { Connection, Request} = require('tedious');
const connection = require('../config/db');
const upload = require('../config/diskStorage');

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


exports.uploadImage = (req, res, next) => {
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
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
};