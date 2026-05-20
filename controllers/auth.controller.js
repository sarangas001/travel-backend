const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const {
    hashPassword,
    comparePassword,
    signAccessToken,
    createRefreshTokenPayload,
    signRefreshToken,
    verifyRefreshToken,
    hashToken,
    compareToken
} = require('../utils/auth');
const {
    validateRegisterPayload,
    validateLoginPayload
} = require('../validation/requests');

const accessTokenCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000
};

const setAuthCookies = (res, accessToken) => {
    res.cookie('token', accessToken, accessTokenCookieOptions);
};

const buildAuthResponse = async (user) => {
    const accessToken = signAccessToken({
        sub: user._id.toString(),
        email: user.email,
        roles: user.roles
    });

    const { tokenId, expiresAt } = createRefreshTokenPayload(user._id.toString());
    const refreshToken = signRefreshToken({
        sub: user._id.toString(),
        tid: tokenId
    });

    const tokenHash = await hashToken(refreshToken);

    await RefreshToken.create({
        userId: user._id,
        tokenId,
        tokenHash,
        expiresAt
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profile: user.profile,
            roles: user.roles
        }
    };
};

const register = async (req, res, next) => {
    try {
        const errors = validateRegisterPayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const passwordHash = await hashPassword(password);
        const user = await User.create({
            username: username.trim(),
            email: email.toLowerCase(),
            passwordHash,
            authProvider: 'local',
            roles: ['user']
        });

        const authResponse = await buildAuthResponse(user);
        setAuthCookies(res, authResponse.accessToken);

        res.status(201).json(authResponse);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const errors = validateLoginPayload(req.body);

        if (errors.length) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatches = await comparePassword(password, user.passwordHash);

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const authResponse = await buildAuthResponse(user);
        setAuthCookies(res, authResponse.accessToken);

        res.status(200).json(authResponse);
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'refreshToken is required' });
        }

        const decoded = verifyRefreshToken(token);
        const storedToken = await RefreshToken.findOne({
            tokenId: decoded.tid,
            userId: decoded.sub,
            revokedAt: null
        });

        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const tokenMatches = await compareToken(token, storedToken.tokenHash);

        if (!tokenMatches) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        storedToken.revokedAt = new Date();
        await storedToken.save();

        const authResponse = await buildAuthResponse(user);
        setAuthCookies(res, authResponse.accessToken);

        res.status(200).json(authResponse);
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'refreshToken is required' });
        }

        const decoded = verifyRefreshToken(token);
        const storedToken = await RefreshToken.findOne({
            tokenId: decoded.tid,
            userId: decoded.sub,
            revokedAt: null
        });

        if (storedToken) {
            storedToken.revokedAt = new Date();
            await storedToken.save();
        }

        await res.clearCookie('token');
        await res.clearCookie('refreshToken');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(200).json({ message: 'Logged out successfully' });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout
};