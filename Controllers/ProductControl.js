const Product = require('../Models/ProductModel');


const addProduct = async (req, res) => {
  try {
    // console.log("User Info:", req.user); // Debugging line to check req.user
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

const DeleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete a product. Only sellers and admins can perform this action.');
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message,
    });
  }
};

const GetProducts = async (req, res) => {
  try {
    const products = await Product.find({ 'status': 'active', stock: { $gt: 0 } });
    res.status(200).json({ products });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message,
    });
  }
};

const GetProductbyId = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message,
    });
  }
}

const GetProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if(req.user.role !== 'seller' && req.user.role !== 'admin' || req.user.id !== sellerId) {
      res.status(403);
      throw new Error('Not authorized to view products by seller. Only sellers and admins can perform this action.');
    }

    const products = await Product.find({ seller: sellerId });
    res.status(200).json({ products });
  } catch (error) {
    res.status(res.statusCode || 500).json({
      message: error.message,
    });
  }
}

module.exports = { addProduct, DeleteProduct, GetProducts, GetProductbyId, GetProductsBySeller };