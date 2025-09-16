const bcrypt = require('bcryptjs');
const { default: User } = require('../Models/userModel');
const { generateAuthToken } = require('../Middleware/Functions');

const sellerRegister = async (req, res) => {
    try {
        const { fullName, email, password, cnfPassword, phone } = req.body;

        if (!fullName || !email || !password || !cnfPassword || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== cnfPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ message: "A user with this email or phone number already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newSeller = new User({
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: 'seller',
            accountStatus: 'pending'
        });
        await newSeller.save();

        return res.status(201).json({
            message: "Seller registered successfully",
            seller: { id: newSeller._id, fullName: newSeller.fullName, email: newSeller.email }
        });

    } catch (error) {
        console.error("Error in seller registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email, role: 'seller' });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if(user.accountStatus !== 'active') {
            return res.status(403).json({ message: `Your account Status is ${user.accountStatus}. Contact support for assistance.` });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const token = generateAuthToken(user);

        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred during login.' });
    }
};

module.exports = { sellerRegister, sellerLogin };