const express = require('express');
const { customerLogin, customerRegister, getCustomerProfile } = require('../Auth/customerAuth');
const {VerifyJWT} = require('../Middleware/Functions');
const { updateCustomerProfile, addwishlist, removeFromWishList, getAllwishList } = require('../Controllers/CustomerControl');



const router = express.Router();

// Auth Routes
router.post('/auth/login', customerLogin);
router.post('/auth/register', customerRegister);

// Profile Routes
router.get('/profile', VerifyJWT, getCustomerProfile);
router.put('/updateprofile', VerifyJWT, updateCustomerProfile);

// wishlist Routes
router.put('/addwishlist/:productId', VerifyJWT, addwishlist);
router.put('/removewishlist/:productId', VerifyJWT, removeFromWishList);
router.get('/getwishlist', VerifyJWT, getAllwishList);



module.exports = router;