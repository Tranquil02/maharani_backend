import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  line1: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    default:"",
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["customer", "seller", "admin", "superadmin"],
    default: "customer"
  },

  profileImage: {
    type: String,
    default: ""
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "male"
  },

  dob: {
    type: Date
  },

  addresses: [addressSchema],

  preferences: {
    language: { type: String, default: "en" },
    currency: { type: String, default: "INR" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
  },

  accountStatus: {
    type: String,
    enum: ["active", "pending", "deactivated"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
export default User;