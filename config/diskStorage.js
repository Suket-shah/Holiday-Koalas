const multer = require('multer');
const path = require('path');

// Storage Engine Setup
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb) {
        fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null,fileName);
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 2000000},
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

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

module.exports = upload;