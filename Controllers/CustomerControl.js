const bcrypt = require('bcryptjs');
const { default: User } = require('../Models/userModel');


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

module.exports = { updateCustomerProfile };
