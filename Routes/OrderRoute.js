const express = require('express');
const router = express.Router();
const { VerifyJWT } = require('../Middleware/Functions');
const {
    placeOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
    initiateReturn,
    getSellerAnalytics,
    getOrderHistory
} = require('../Controllers/OrderControl');

// Core Order Operations
router.post('/place-order', VerifyJWT, placeOrder);
router.get('/my-orders', VerifyJWT, getMyOrders);
router.get('/seller-orders', VerifyJWT, getSellerOrders);

// Order Management
router.put('/update-status', VerifyJWT, updateOrderStatus);
router.put('/cancel-order', VerifyJWT, cancelOrder);
router.post('/initiate-return', VerifyJWT, initiateReturn);

// Analytics & History
router.get('/seller-analytics', VerifyJWT, getSellerAnalytics);
router.get('/order/:orderId', VerifyJWT, getOrderHistory);

module.exports = router;