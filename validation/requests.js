const emailPattern = /.+\@.+\..+/;

const validateRegisterPayload = (payload) => {
    const errors = [];

    if (!payload.username || typeof payload.username !== 'string' || payload.username.trim().length < 3) {
        errors.push('username must be at least 3 characters');
    }

    if (!payload.email || typeof payload.email !== 'string' || !emailPattern.test(payload.email)) {
        errors.push('email must be a valid email address');
    }

    if (!payload.password || typeof payload.password !== 'string' || payload.password.length < 8) {
        errors.push('password must be at least 8 characters');
    }

    return errors;
};

const validateLoginPayload = (payload) => {
    const errors = [];

    if (!payload.email || typeof payload.email !== 'string' || !emailPattern.test(payload.email)) {
        errors.push('email must be a valid email address');
    }

    if (!payload.password || typeof payload.password !== 'string') {
        errors.push('password is required');
    }

    return errors;
};

const validateProfilePayload = (payload) => {
    const errors = [];

    if (payload.firstName !== undefined && typeof payload.firstName !== 'string') {
        errors.push('firstName must be a string');
    }

    if (payload.lastName !== undefined && typeof payload.lastName !== 'string') {
        errors.push('lastName must be a string');
    }

    if (payload.avatarUrl !== undefined && typeof payload.avatarUrl !== 'string') {
        errors.push('avatarUrl must be a string');
    }

    return errors;
};

const validateSavedPlacePayload = (payload) => {
    const errors = [];

    if (!payload.destinationId || typeof payload.destinationId !== 'string') {
        errors.push('destinationId is required');
    }

    return errors;
};

const validateDestinationPayload = (payload) => {
    const errors = [];

    if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
        errors.push('name must be at least 2 characters');
    }

    if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length < 10) {
        errors.push('description must be at least 10 characters');
    }

    if (!payload.category || typeof payload.category !== 'string') {
        errors.push('category is required');
    }

    if (!payload.location || typeof payload.location !== 'object') {
        errors.push('location is required');
    } else {
        if (payload.location.type !== 'Point') {
            errors.push('location.type must be Point');
        }

        if (!Array.isArray(payload.location.coordinates) || payload.location.coordinates.length !== 2) {
            errors.push('location.coordinates must be an array of [longitude, latitude]');
        } else {
            const [longitude, latitude] = payload.location.coordinates;

            if (typeof longitude !== 'number' || typeof latitude !== 'number') {
                errors.push('location.coordinates must contain numeric longitude and latitude');
            }
        }
    }

    if (payload.media !== undefined && !Array.isArray(payload.media)) {
        errors.push('media must be an array when provided');
    }

    if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
        errors.push('tags must be an array when provided');
    }

    return errors;
};

const validateReviewPayload = (payload) => {
    const errors = [];

    if (payload.rating === undefined || typeof payload.rating !== 'number' || payload.rating < 1 || payload.rating > 5) {
        errors.push('rating must be a number between 1 and 5');
    }

    if (payload.comment !== undefined && typeof payload.comment !== 'string') {
        errors.push('comment must be a string when provided');
    }

    return errors;
};

module.exports = {
    validateRegisterPayload,
    validateLoginPayload,
    validateProfilePayload,
    validateSavedPlacePayload,
    validateDestinationPayload,
    validateReviewPayload
};