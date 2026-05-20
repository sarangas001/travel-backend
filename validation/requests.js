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

module.exports = {
    validateRegisterPayload,
    validateLoginPayload,
    validateProfilePayload,
    validateSavedPlacePayload
};