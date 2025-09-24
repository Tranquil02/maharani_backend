const express = require('express');
const { approveSeller, rejectSeller, activeSellers, pendingSellers, approveProduct, rejectProduct, getAllUsers } = require('../Controllers/AdminControl');
const { isAdminOrSuperAdmin, VerifyJWT } = require('../Middleware/Functions');

const Router = express.Router();

//Approve or Reject Seller
Router.put('/approve/:sellerId', VerifyJWT, isAdminOrSuperAdmin, approveSeller);
Router.put('/reject/:sellerId', VerifyJWT, isAdminOrSuperAdmin, rejectSeller);

// get active and Pending Sellers
Router.get('/activesellers', VerifyJWT, isAdminOrSuperAdmin, activeSellers);
Router.get('/pendingsellers', VerifyJWT, isAdminOrSuperAdmin, pendingSellers);

// Approve or Reject Products
Router.put('/approveproduct/:productId', VerifyJWT, isAdminOrSuperAdmin, approveProduct);
Router.put('/rejectproduct/:productId', VerifyJWT, isAdminOrSuperAdmin, rejectProduct);

// Get All Users
Router.get('/allusers',VerifyJWT,isAdminOrSuperAdmin,getAllUsers)

module.exports = Router;