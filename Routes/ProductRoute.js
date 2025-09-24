const express = require('express');
const { VerifyJWT} = require('../Middleware/Functions');
const { addProduct, DeleteProduct, GetProductbyId, GetProductsBySeller, GetSellerProducts, GetProductsbySeller, GetProductsbyCategory, GetAllProducts, UpdateProduct } = require('../Controllers/ProductControl');



const router = express.Router();

//Seller or admin can Add or delete Product or  Update Product 
router.post('/addProduct', VerifyJWT, addProduct);
router.delete('/deleteProduct/:productId', VerifyJWT, DeleteProduct);
router.put('/updateProduct/:productId',VerifyJWT,UpdateProduct);

// Get Products
router.get('/getProducts', VerifyJWT, GetAllProducts);
router.get('/getProduct/:productId', VerifyJWT, GetProductbyId);

//Get all Product of Seller only seller or admin can access
router.get('/getallProduct/seller/:sellerId',VerifyJWT,GetSellerProducts);

// Get all Product by seller Which is active and in stock
router.get('/getsellerProduct/seller/:sellerId',VerifyJWT,GetProductsbySeller);

// Get All Products by Category which is active and in stock
router.get('/getcategoryProduct/:category',VerifyJWT,GetProductsbyCategory);

module.exports = router;