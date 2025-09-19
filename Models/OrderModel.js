const mongoose = require('mongoose');

const ProductOrderSchema = new mongoose.Schema({
    OrderID: { type: String, required: true, unique: true },
    transactionId: { type: String, unique: true }, //

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    ProductID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    itemQuantity: { type: Number },

    paymentMode: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Processing", "Paid", "Failed", "Refunded"], default: "Pending" },
    status: { type: String, enum: ["confirmed", "completed", "cancelled", "in-transit"], default: "confirmed" },

    deliveryAddress: {
        houseNo: { type: String },
        street: { type: String },
        landmark: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: Number },
    },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    cancellationDate: { type: Date },
    cancellationReason: { type: String },
    returnDate: { type: Date },
    returnReason: { type: String },
    feedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    updatedAt: { type: Date, default: Date.now },
    statusHistory: [{
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }]
})

// Add indexes for better query performance
ProductOrderSchema.index({ userId: 1, orderDate: -1 });
ProductOrderSchema.index({ sellerID: 1, orderDate: -1 });
ProductOrderSchema.index({ OrderID: 1 });
ProductOrderSchema.index({ status: 1 });
ProductOrderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('ProductOrder', ProductOrderSchema);