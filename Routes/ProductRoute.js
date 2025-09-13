const express = require('express');
const {authorizeUser} = require('../Middleware/user');
const { addProduct } = require('../Controllers/ProductControl');



const router = express.Router();

router.post('/addProduct', authorizeUser, addProduct);

module.exports = router;