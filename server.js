const express = require('express');

// Import Routes
const customerRoutes = require('./Routes/customerRoute');
const productRoutes = require('./Routes/ProductRoute');
const sellerRoutes=require("./Routes/sellerRoute");
const AdminRoutes=require("./Routes/AdminRoute");
const CartRoutes=require("./Routes/CartRoute");
const orderRoutes = require('./Routes/OrderRoute');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();

app.use(express.json());

//API Routes
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/product',productRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/cart',CartRoutes);
app.use('/api/v1/order', orderRoutes);

const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
