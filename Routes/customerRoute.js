const express = require('express');
const { customerLogin, customerRegister } = require('../Auth/customerAuth');


const router = express.Router();

// Login Route
router.post('/login', customerLogin);

// Registration Route
router.post('/register', customerRegister);

module.exports = router;