const razorpay = require('../config/razorpay');
const Order = require('../Models/OrderModel');
const crypto = require('crypto');



// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
    try {
        const { OrderID } = req.body;
        
        // Find the order in our database
        const order = await Order.findOne({ OrderID })
            .populate('ProductID', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user has permission
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: order.totalAmount * 100, // Convert to paise
            currency: 'INR',
            receipt: OrderID,
            notes: {
                orderID: OrderID,
                userID: req.user.id
            }
        });

        res.status(200).json({
            success: true,
            order: razorpayOrder,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Error creating payment order' });
    }
};

// Verify Razorpay Payment
const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            OrderID 
        } = req.body;

        // Find our order
        const order = await Order.findOne({ OrderID });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update order payment status
        order.paymentStatus = 'Paid';
        order.statusHistory.push({
            status: 'Payment: Paid',
            changedAt: new Date(),
            changedBy: req.user.id
        });
        
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully'
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

// Handle Razorpay Webhook
const handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        // Verify webhook signature
        if (digest !== req.headers['x-razorpay-signature']) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const { payload } = req.body;
        const { payment } = payload;

        if (payment && payment.entity) {
            const { order_id, status } = payment.entity;

            // Find our order using receipt (our OrderID)
            const razorpayOrder = await razorpay.orders.fetch(order_id);
            const order = await Order.findOne({ OrderID: razorpayOrder.receipt });

            if (order) {
                // Update payment status based on webhook event
                switch (status) {
                    case 'captured':
                        order.paymentStatus = 'Paid';
                        break;
                    case 'failed':
                        order.paymentStatus = 'Failed';
                        break;
                    case 'refunded':
                        order.paymentStatus = 'Refunded';
                        break;
                    default:
                        order.paymentStatus = 'Processing';
                }

                order.statusHistory.push({
                    status: `Payment: ${order.paymentStatus}`,
                    changedAt: new Date(),
                    changedBy: order.userId
                });

                await order.save();
            }
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

modules.exports ={createRazorpayOrder, verifyPayment, handleWebhook};