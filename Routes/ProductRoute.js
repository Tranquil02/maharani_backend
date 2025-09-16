const express = require('express');
const { VerifyJWT} = require('../Middleware/Functions');
const { addProduct } = require('../Controllers/ProductControl');



const router = express.Router();

router.post('/addProduct', VerifyJWT, addProduct);

module.exports = router;