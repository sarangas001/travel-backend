const notImplemented = (req, res) => {
    res.status(501).json({ message: 'Authentication flow is not implemented yet' });
};

module.exports = {
    register: notImplemented,
    login: notImplemented,
    refreshToken: notImplemented,
    logout: notImplemented
};