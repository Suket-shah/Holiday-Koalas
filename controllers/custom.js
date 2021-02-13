const { Connection, Request} = require('tedious');
const connection = require('../config/db');
const path = require('path');

function imgQuery(id) {
    return `SELECT baseimg FROM images WHERE frontendID='${id}';`
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

exports.customImage = (req, res, next) => {
    let result = getImg(req.params.id);
    result.on('doneInProc', async (rowCount, more, rows) => {
        if(rowCount === 0) {
            res.render(path.join(__dirname, '../index.ejs'), {
                data: 'koalas1.jpg',
                link: null
            });  
        } else {
            res.render(path.join(__dirname, '../index.ejs'), {
                data: 'uploads/' + rows[0][0].value
            });
        }
    })
};