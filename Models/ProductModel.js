const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number,default:0 },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true },
        comment: { type: String }
    }],
    status: { type: String, enum: ['active','pending', 'rejected'], default: 'pending' },
    stock: { type: Number, default: 0 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
