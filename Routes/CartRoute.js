const express=require('express');
const { addToCart, getCart, updateCartItemQuantity, removeFromCart } = require('../Controllers/CartControl');
const { VerifyJWT } = require('../Middleware/Functions');


const Router=express.Router();

Router.post('/add-to-cart',VerifyJWT,addToCart);
Router.get('/get-cart',VerifyJWT,getCart);

Router.put('/update-cart',VerifyJWT,updateCartItemQuantity);

Router.delete('/remove-item',VerifyJWT,removeFromCart);

module.exports=Router;