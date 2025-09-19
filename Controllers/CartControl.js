const Cart = require("../Models/CartModel");
const Product = require("../Models/ProductModel");


// Add a new item to the cart or update the quantity of an existing one.
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [{ productId, quantity }]
            });
            return res.status(201).json({ message: 'Item added to new cart', cart });
        }

        // Check if the item already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // Update quantity if item exists
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item to the cart
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};


// Get the user's cart and populate product details
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        // Populate the product details for each item in the cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};

// ---

// Update the quantity of a specific item in the cart
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
            // If quantity is 0 or less, remove the item from the cart
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

// ---

// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        // Filter out the item to be removed
        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        if (cart.items.length === initialItemCount) {
            return res.status(404).json({ message: 'Item not found in cart to remove.' });
        }

        await cart.save();
        res.status(200).json({ message: 'Item removed from cart', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};

// ---

// Clear the entire cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        cart.items = []; // Empty the items array
        await cart.save();
        res.status(200).json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error });
    }
};