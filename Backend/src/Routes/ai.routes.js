const express = require('express')
const {reviewCodeController} = require('../Controllers/reviewController')

const router = express.Router();

router.post('/review',reviewCodeController)

module.exports = router