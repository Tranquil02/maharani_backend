const express = require('express');
const mongoose = require('mongoose');

// Import Routes
const customerRoutes = require('./Routes/customerRoute');
const productRoutes = require('./Routes/ProductRoute');
const sellerRoutes=require("./Routes/sellerRoute");
const AdminRoutes=require("./Routes/AdminRoute");

require('dotenv').config();

const app = express();

app.use(express.json());

//API Routes
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/product',productRoutes);
app.use('/api/v1/seller', sellerRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/MaharaniDB';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
