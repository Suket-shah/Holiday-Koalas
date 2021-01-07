const express = require('express');
const router = express.Router();

const { request } = require('express');
const {uploadImage} = require('../controllers/upload.js');

router.post('/upload', uploadImage);
module.exports = router;