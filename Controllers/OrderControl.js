const Order = require('../Models/OrderModel');
const Cart = require('../Models/CartModel');
const Product = require('../Models/ProductModel');
const { default: User } = require('../Models/userModel');

// Helper Functions
const generateOrderID = () => {
    const timestamp = new Date().getTime().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `ORD-${timestamp}-${random}`;
};

const generateTransactionId = () => {
    const timestamp = new Date().getTime().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN-${timestamp}-${random}`;
};

const validateStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        'confirmed': ['in-transit', 'cancelled'],
        'in-transit': ['completed'],
        'completed': [],
        'cancelled': []
    };
    return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Core Order Operations
exports.placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, paymentMode } = req.body;

        if (!paymentMode) {
            return res.status(400).json({ message: 'Payment mode is required' });
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Get user's address
        const user = await User.findById(userId);
        const userAddress = user.addresses.find(addr => addr._id.toString() === addressId);
        if (!userAddress) {
            return res.status(400).json({ message: 'Invalid delivery address' });
        }

        // Map address to order schema format
        const deliveryAddress = {
            houseNo: userAddress.line1,
            street: userAddress.line1,
            city: userAddress.city,
            state: userAddress.state,
            pincode: Number(userAddress.pincode),
            landmark: ''
        };

        // Validate stock and create orders
        const orders = [];
        const stockUpdates = [];

        for (const item of cart.items) {
            const product = item.productId;

            // Check product status
            if (product.status !== 'active') {
                return res.status(400).json({
                    message: `Product ${product.name} is not available for purchase`
                });
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }

            // Calculate price
            const unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            const totalAmount = unitPrice * item.quantity;

            // Prepare stock update with check
            stockUpdates.push({
                updateOne: {
                    filter: {
                        _id: product._id,
                        stock: { $gte: item.quantity }
                    },
                    update: { $inc: { stock: -item.quantity } }
                }
            });

            // Create order
            const order = new Order({
                OrderID: generateOrderID(),
                userId,
                ProductID: product._id,
                sellerID: product.seller,
                itemQuantity: item.quantity,
                totalAmount,
                deliveryAddress,
                paymentMode,
                transactionId: generateTransactionId(),
                expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                status: 'confirmed',
                paymentStatus: 'Pending'
            });

            orders.push(order);
        }

        // Execute all operations in a transaction
        const session = await Order.startSession();
        try {
            await session.withTransaction(async () => {
                // Update product stock
                const stockResult = await Product.bulkWrite(stockUpdates, { session });

                // Verify all stock updates succeeded
                if (stockResult.modifiedCount !== stockUpdates.length) {
                    throw new Error('Stock update failed - insufficient quantity');
                }

                // Create orders
                await Order.insertMany(orders, { session });

                // Clear cart
                await Cart.deleteOne({ userId }, { session });
            });
        } finally {
            await session.endSession();
        }

        res.status(201).json({
            message: 'Orders placed successfully',
            orders: orders.map(o => o.OrderID)
        });
    } catch (error) {
        console.error('Error in placeOrder:', error);
        res.status(500).json({ message: 'Error placing order' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const query = { userId: req.user.id };
        if (status) query.status = status;
        if (startDate && endDate) {
            query.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query)
            .populate('ProductID', 'name images price discountPrice status')
            .sort({ orderDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total
        });
    } catch (error) {
        console.error('Error in getMyOrders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ OrderID: req.params.orderId })
            .populate('ProductID', 'name images price discountPrice description status')
            .populate('userId', 'fullName email')
            .populate('sellerID', 'fullName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user has permission to view this order
        if (req.user.role !== 'admin' &&
            req.user.id !== order.userId.toString() &&
            req.user.id !== order.sellerID.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(500).json({ message: 'Error fetching order details' });
    }
};
exports.getSellerOrders = async (req, res) => {
    try {
        if (req.user.role !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const query = { sellerID: req.user.id };
        if (status) query.status = status;
        if (startDate && endDate) {
            query.orderDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query)
            .populate('ProductID', 'name images price discountPrice status')
            .populate('userId', 'fullName email')
            .sort({ orderDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total
        });
    } catch (error) {
        console.error('Error in getSellerOrders:', error);
        res.status(500).json({ message: 'Error fetching seller orders' });
    }
};

// Order Management
exports.updateOrderStatus = async (req, res) => {
    try {
        const { OrderID, newStatus } = req.body;
        const order = await Order.findOne({ OrderID });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user has permission to update this order
        if (req.user.role !== 'admin' && req.user.id !== order.sellerID.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate status transition
        if (!validateStatusTransition(order.status, newStatus)) {
            return res.status(400).json({
                message: 'Invalid status transition. Valid transitions are: confirmed → in-transit → completed'
            });
        }

        // Add status to history
        order.statusHistory.push({
            status: newStatus,
            changedAt: new Date(),
            changedBy: req.user.id
        });

        order.status = newStatus;
        if (newStatus === 'completed') {
            order.actualDeliveryDate = new Date();
        }

        await order.save();
        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { OrderID, reason } = req.body;
        const order = await Order.findOne({ OrderID });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user has permission to cancel this order
        if (req.user.role !== 'admin' &&
            req.user.id !== order.userId.toString() &&
            req.user.id !== order.sellerID.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if order can be cancelled
        if (!validateStatusTransition(order.status, 'cancelled')) {
            return res.status(400).json({
                message: 'Order cannot be cancelled in current status'
            });
        }

        const session = await Order.startSession();
        try {
            await session.withTransaction(async () => {
                // Update order status
                order.status = 'cancelled';
                order.cancellationReason = reason;
                order.cancellationDate = new Date();
                await order.save({ session });

                // Restore product stock
                await Product.updateOne(
                    { _id: order.ProductID },
                    { $inc: { stock: order.itemQuantity } },
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        res.status(200).json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        res.status(500).json({ message: 'Error cancelling order' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { OrderID, paymentStatus } = req.body;
        const validStatuses = ["Pending", "Processing", "Paid", "Failed", "Refunded"];

        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                message: 'Invalid payment status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const order = await Order.findOne({ OrderID });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only admin or seller can update payment status
        if (req.user.role !== 'admin' && req.user.id !== order.sellerID.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Add status to history with payment prefix
        order.statusHistory.push({
            status: `Payment: ${paymentStatus}`,
            changedAt: new Date(),
            changedBy: req.user.id
        });

        order.paymentStatus = paymentStatus;
        await order.save();

        res.status(200).json({
            message: 'Payment status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error in updatePaymentStatus:', error);
        res.status(500).json({ message: 'Error updating payment status' });
    }
};

// Returns & Refunds
exports.initiateReturn = async (req, res) => {
    try {
        const { OrderID, reason } = req.body;
        const order = await Order.findOne({ OrderID });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (req.user.id !== order.userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Can only return completed orders
        if (order.status !== 'completed') {
            return res.status(400).json({
                message: 'Return can only be initiated for completed orders'
            });
        }

        // Update return information
        order.returnReason = reason;
        order.returnDate = new Date();
        await order.save();

        res.status(200).json({
            message: 'Return initiated successfully',
            order
        });
    } catch (error) {
        console.error('Error in initiateReturn:', error);
        res.status(500).json({ message: 'Error initiating return' });
    }
};

exports.processRefund = async (req, res) => {
    try {
        const { OrderID, refundAmount } = req.body;
        const order = await Order.findOne({ OrderID });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only admin or seller can process refund
        if (req.user.role !== 'admin' && req.user.id !== order.sellerID.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate refund amount
        if (refundAmount > order.totalAmount) {
            return res.status(400).json({
                message: 'Refund amount cannot exceed order amount'
            });
        }

        const session = await Order.startSession();
        try {
            await session.withTransaction(async () => {
                // Update payment status to refunded
                order.paymentStatus = 'Refunded';

                // If it's a cancellation refund, status should be cancelled
                if (order.status === 'confirmed') {
                    order.status = 'cancelled';
                    order.cancellationDate = new Date();
                    order.cancellationReason = 'Refunded due to cancellation';
                }

                await order.save({ session });

                // Restore product stock if cancelled before delivery
                if (order.status === 'cancelled') {
                    await Product.updateOne(
                        { _id: order.ProductID },
                        { $inc: { stock: order.itemQuantity } },
                        { session }
                    );
                }
            });
        } finally {
            await session.endSession();
        }

        res.status(200).json({
            message: 'Refund processed successfully',
            order
        });
    } catch (error) {
        console.error('Error in processRefund:', error);
        res.status(500).json({ message: 'Error processing refund' });
    }
};

// Analytics
exports.getSellerAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const analytics = await Order.aggregate([
            {
                $match: {
                    sellerID: req.user.id,
                    orderDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelledOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    totalRefunds: {
                        $sum: {
                            $cond: [
                                { $eq: ['$paymentStatus', 'Refunded'] },
                                '$totalAmount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Get top selling products
        const topProducts = await Order.aggregate([
            {
                $match: {
                    sellerID: req.user.id,
                    orderDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$ProductID',
                    totalQuantity: { $sum: '$itemQuantity' },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    productName: '$product.name',
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);

        res.status(200).json({
            analytics: analytics[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                totalRefunds: 0
            },
            topProducts
        });
    } catch (error) {
        console.error('Error in getSellerAnalytics:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

// Get order history
exports.getOrderHistory = async (req, res) => {
    try {
        const order = await Order.findOne({ OrderID: req.params.orderId })
            .select('statusHistory OrderID userId sellerID')
            .populate('statusHistory.changedBy', 'fullName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user has permission to view this order's history
        if (req.user.role !== 'admin' &&
            req.user.id !== order.userId.toString() &&
            req.user.id !== order.sellerID.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json({
            OrderID: order.OrderID,
            history: order.statusHistory.sort((a, b) => b.changedAt - a.changedAt)
        });
    } catch (error) {
        console.error('Error in getOrderHistory:', error);
        res.status(500).json({ message: 'Error fetching order history' });
    }
};
