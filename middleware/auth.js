const { verifyAccessToken } = require('../utils/auth');

const protect = (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const [, token] = authorization.split(' ');

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    next();
};

module.exports = { protect, requireRole };