const express = require('express');
const { approveSeller, rejectSeller, activeSellers, pendingSellers } = require('../Controllers/AdminControl');
const { isAdminOrSuperAdmin, VerifyJWT } = require('../Middleware/Functions');

const Router = express.Router();

//Approve or Reject Seller
Router.put('/approve/:sellerId', VerifyJWT, isAdminOrSuperAdmin, approveSeller);
Router.put('/reject/:sellerId', VerifyJWT, isAdminOrSuperAdmin, rejectSeller);

// get active and Pending Sellers
Router.get('/activesellers', VerifyJWT, isAdminOrSuperAdmin, activeSellers);
Router.get('/pendingsellers', VerifyJWT, isAdminOrSuperAdmin, pendingSellers);

module.exports = Router;