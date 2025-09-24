const Product = require('../Models/ProductModel');

const User = require('../Models/userModel').default;

const approveSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Find the user and update their accountStatus to 'approved'
        const updatedSeller = await User.findByIdAndUpdate(
            sellerId,
            { accountStatus: 'active' },
            { new: true } // Return the updated document
        ).select('-password');

        if (!updatedSeller) {
            return res.status(404).json({ message: 'Seller not found.' });
        }

        res.status(200).json({
            message: 'Seller approved successfully.',
            seller: updatedSeller,
        });
    } catch (error) {
        console.error('Error approving seller:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const rejectSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Find the user and update their accountStatus to 'deactivated' or 'rejected'
        const updatedSeller = await User.findByIdAndUpdate(
            sellerId,
            { accountStatus: 'rejected' },
            { new: true }
        ).select('-password');

        if (!updatedSeller) {
            return res.status(404).json({ message: 'Seller not found.' });
        }

        res.status(200).json({
            message: 'Seller rejected successfully.',
            seller: updatedSeller,
        });
    } catch (error) {
        console.error('Error rejecting seller:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const activeSellers= async (req,res)=>{
    try{
        const sellers = await User.find({role:'seller', accountStatus:'active'}).select('-password');
        res.status(200).json({sellers});
    }catch(error){
        console.error('Error fetching active sellers:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

const pendingSellers= async (req,res)=>{
    try{    
        const sellers = await User.find({role:'seller', accountStatus:'pending'}).select('-password');
        res.status(200).json({sellers});
    }catch(error){
        console.error('Error fetching pending sellers:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

const approveProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        // Logic to approve the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { status: 'active' },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ message: 'Product approved successfully.' });
    } catch (error) {
        console.error('Error approving product:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const rejectProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        // Logic to reject the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { status: 'rejected' },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ message: 'Product rejected successfully.' });
    } catch (error) {
        console.error('Error rejecting product:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
       res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



module.exports = { approveSeller, rejectSeller, activeSellers, pendingSellers, approveProduct, rejectProduct, getAllUsers };