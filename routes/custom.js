const express = require('express');
const router = express.Router();

const {customImage} = require('../controllers/custom');

router.get('/:id', customImage);
module.exports = router;