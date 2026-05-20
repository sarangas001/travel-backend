const notImplemented = (req, res) => {
    res.status(501).json({ message: 'Saved places workflow is not implemented yet' });
};

module.exports = {
    listSavedPlaces: notImplemented,
    saveDestination: notImplemented,
    unsaveDestination: notImplemented
};