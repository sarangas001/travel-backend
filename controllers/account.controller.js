const notImplemented = (req, res) => {
    res.status(501).json({ message: 'Account profile flow is not implemented yet' });
};

module.exports = {
    getProfile: notImplemented,
    updateProfile: notImplemented
};