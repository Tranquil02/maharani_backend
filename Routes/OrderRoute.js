const express = require('express');
const router = express.Router();
const { VerifyJWT } = require('../Middleware/Functions');
const {
    placeOrder,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
    updatePaymentStatus,
    initiateReturn,
    processRefund,
    getSellerAnalytics,
    getOrderHistory
} = require('../Controllers/OrderControl');

// Core Order Operations
router.post('/place-order', VerifyJWT, placeOrder);
router.get('/my-orders', VerifyJWT, getMyOrders);
router.get('/order/:orderId', VerifyJWT, getOrderById);
router.get('/seller-orders', VerifyJWT, getSellerOrders);

// Order Management
router.put('/update-status', VerifyJWT, updateOrderStatus);
router.put('/cancel-order', VerifyJWT, cancelOrder);
router.put('/update-payment', VerifyJWT, updatePaymentStatus);

// Returns & Refunds
router.post('/initiate-return', VerifyJWT, initiateReturn);
router.put('/process-refund', VerifyJWT, processRefund);

// Analytics
router.get('/seller-analytics', VerifyJWT, getSellerAnalytics);

// Order History
router.get('/order/:orderId/history', VerifyJWT, getOrderHistory);

module.exports = router;