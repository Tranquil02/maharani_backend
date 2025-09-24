const mongoose = require('mongoose');

const ProductOrderSchema = new mongoose.Schema({
  OrderID: { type: String, required: true, unique: true },
  transactionId: { type: String, unique: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  ProductID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  itemQuantity: { type: Number, default: 1 },

  paymentMode: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Processing", "Paid", "Failed", "Refunded"], 
    default: "Pending" 
  },
  status: { 
    type: String, 
    enum: ["confirmed", "completed", "cancelled", "in-transit"], 
    default: "confirmed" 
  },

  deliveryAddress: {
    houseNo: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: Number,
  },

  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  cancellationDate: Date,
  cancellationReason: String,
  returnDate: Date,
  returnReason: String,
  feedback: String,
  rating: { type: Number, min: 1, max: 5 },

  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }]
}, {
  timestamps: true 
});

// Compound index for user queries: fetch orders by user, sorted by date
ProductOrderSchema.index({ userId: 1, orderDate: -1 });

// Compound index for seller queries: fetch orders by seller, sorted by date
ProductOrderSchema.index({ sellerID: 1, orderDate: -1 });

// Single-field indexes for frequent queries
ProductOrderSchema.index({ status: 1 });
ProductOrderSchema.index({ paymentStatus: 1 });


module.exports = mongoose.model('ProductOrder', ProductOrderSchema);
