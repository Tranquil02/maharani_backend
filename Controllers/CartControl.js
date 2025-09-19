const Cart = require("../Models/CartModel");
const Product = require("../Models/ProductModel");

// Add a new item to the cart or update the quantity of an existing one
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product || product.status !== 'active') {
            return res.status(404).json({ message: 'Product not found or inactive.' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId,
                items: [{ productId, quantity }]
            });
        } else {
            // Check if product is already in cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json({ message: 'Cart updated successfully', cart });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};

// Get the user's cart and populate product details
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Cart is empty.' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};

//  Update the quantity of a specific item in the cart
exports.updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart.' });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.status(200).json({ message: 'Cart updated successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};

// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in cart.' });
        }

        await cart.save();
        res.status(200).json({ message: 'Item removed from cart', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};
    
// Clear the entire cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};
