const Product = require('../Models/ProductModel');


const addProduct = async (req, res) => {
  try {
    console.log("User Info:", req.user); // Debugging line to check req.user
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to add a product. Only sellers and admins can perform this action.');
    }

    const { name, price, description, images, category, stock } = req.body;

    if (!name || !price || !description || !category) {
      res.status(400);
      throw new Error('Please include all required fields: name, price, description, and category.');
    }

    const product = new Product({
      name,
      price,
      description,
      images,
      category,
      stock,
      seller: req.user.id,
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message,
    });
  }
};

module.exports = { addProduct };