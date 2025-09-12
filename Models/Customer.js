const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    personalInfo: {
      name: {
        type: String,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
      },
      dob: {
        type: Date,
      },
      photo: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
