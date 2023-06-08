const express = require('express');
const { signupHandler } = require('./../controller/account_controller');

const router = express.Router();
router.use(express.json())

router.post('/signup', signupHandler);

module.exports = router;