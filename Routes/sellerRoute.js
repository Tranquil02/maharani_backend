const express = require('express');
const { sellerRegister, sellerLogin } = require('../Auth/sellerAuth');
const { authorizeUser } = require('../Middleware/Functions');

const Router = express.Router();

Router.post('/auth/register', sellerRegister);
Router.post('/auth/login', sellerLogin);


module.exports = Router;