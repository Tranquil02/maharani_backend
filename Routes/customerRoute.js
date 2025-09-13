const express = require('express');
const { customerLogin, customerRegister, getCustomerProfile } = require('../Auth/customerAuth');
const authorizeUser = require('../Middleware/user');


const router = express.Router();

// Login Route
router.post('/auth/login', customerLogin);

// Registration Route
router.post('/auth/register', customerRegister);
router.get('/profile', authorizeUser, getCustomerProfile);

module.exports = router;