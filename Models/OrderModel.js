const mongoose = require('mongoose');

const ProductOrderSchema = new mongoose.Schema({
    OrderID: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, unique: true }, //

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'customer' },
    sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'seller' },

    ProductID: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
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
    }

})

module.exports = mongoose.model('ProductOrder', ProductOrderSchema);