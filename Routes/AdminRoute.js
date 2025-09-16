const express = require('express');
const { approveSeller, rejectSeller } = require('../Controllers/AdminControl');
const { isAdminOrSuperAdmin, VerifyJWT } = require('../Middleware/Functions');

const Router = express.Router();

//Approve or Reject Seller
Router.put('/approve/:sellerId', VerifyJWT, isAdminOrSuperAdmin, approveSeller);
Router.put('/reject/:sellerId', VerifyJWT, isAdminOrSuperAdmin, rejectSeller);

module.exports = Router;