const bcrypt = require('bcryptjs');
const { default: User } = require('../Models/userModel');
const Product = require('../Models/ProductModel');


const updateCustomerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            fullName,
            phone,
            email,
            gender,
            dob,
            profileImage,
            addresses,
            preferences,
            password
        } = req.body;


        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });


        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;
        if (profileImage) user.profileImage = profileImage;
        if (addresses) user.addresses = addresses;
        if (preferences) user.preferences = preferences;


        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }


        user.updatedAt = Date.now();

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dob: user.dob,
                profileImage: user.profileImage,
                addresses: user.addresses,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addwishlist = async (req, res) => {
    try {
        const productID = req.params.productId;
        const userId = req.user.id;

        const product = await Product.findById(productID);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.preferences.wishlist.includes(productID)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }
        user.preferences.wishlist.push(productID);
        await user.save();
        res.status(200).json({ message: 'Product added to wishlist', wishlist: user.preferences.wishlist });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeFromWishList = async (req, res) => {
    try {
        const productID = req.params.productId;
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const index = user.preferences.wishlist.indexOf(productID);
        if (index === -1) return res.status(404).json({ message: 'Product not found in wishlist' });
        user.preferences.wishlist.splice(index, 1);
        await user.save();
        res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.preferences.wishlist });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getAllwishList = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const wishlistProducts = await Product.find({ _id: { $in: user.preferences.wishlist } });
        res.status(200).json({ wishlist: wishlistProducts });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { updateCustomerProfile, addwishlist, removeFromWishList, getAllwishList };
