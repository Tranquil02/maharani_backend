const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const { default: User } = require("../Models/CustomerModel");


const JWT_SECRET = process.env.JWT_SECRET || "4e997ad5e6d386d87889d474bd15a74c";

// Function to generate JWT token
// const generateAuthToken = (user) => {
//     const payload = { id: user._id, email: user.email, role: user.role };
//     return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
// };

// Customer Login
const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const payload = { id: user._id, email: user.email, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred during login.' });
    }
};


const customerRegister = async (req, res) => {
    try {
        const { fullName, email, password, cnfPassword, phone } = req.body;

        if (!fullName || !email || !password || !cnfPassword || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== cnfPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check for an existing user by email or phone.
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ message: "A user with this email or phone number already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create a new User instance. 
        const newUser = new User({
            fullName,
            email,
            phone,
            password: hashedPassword,
        });
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email }
        });

    } catch (error) {
        console.error("Error in customer registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getCustomerProfile = async (req, res) => {
    try {
        // req.user contains the payload from the JWT token (e.g., { id, email, role })
        const userId = req.user.id; 

        // Now you can find the full user profile from the database
        const user = await User.findById(userId).select('-password'); // Exclude the password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { customerLogin, customerRegister, getCustomerProfile };