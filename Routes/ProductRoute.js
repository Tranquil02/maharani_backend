const express = require('express');
const { VerifyJWT} = require('../Middleware/Functions');
const { addProduct, DeleteProduct, GetProducts, GetProductbyId, GetProductsBySeller } = require('../Controllers/ProductControl');



const router = express.Router();

//Seller or admin can Add or delete Product
router.post('/addProduct', VerifyJWT, addProduct);
router.delete('/deleteProduct/:productId', VerifyJWT, DeleteProduct);

// Get Products
router.get('/getProducts', VerifyJWT, GetProducts);
router.get('/getProduct/:productId', VerifyJWT, GetProductbyId);

//Get Product By Seller
router.get('/getProduct/seller/:sellerId',VerifyJWT,GetProductsBySeller);

module.exports = router;