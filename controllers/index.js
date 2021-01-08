const path = require('path');

exports.getHome = (req, res, next) => {
    res.render(path.join(__dirname, '../index.ejs'), {
        data: 'koalas1.jpg',
        link: null
    })    
};