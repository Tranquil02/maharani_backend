const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "4e997ad5e6d386d87889d474bd15a74c";

// Middleware to verify JWT token
const VerifyJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const generateAuthToken = (user) => {
    const payload = { id: user._id, email: user.email, role: user.role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

const isAdminOrSuperAdmin = (req, res, next) => {
    // console.log(req.user);
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied: Admins and Superadmins Only' });
    }
};

module.exports = { VerifyJWT, generateAuthToken, isAdminOrSuperAdmin };