const jwt = require('jsonwebtoken');

// Verify JWT Token from Request Header
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <TOKEN>"

    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attaches { id, email, role } to req
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Enforce Roles (TENANT vs LANDLORD)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access Denied: Action requires role: ${allowedRoles.join(', ')}` 
            });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };