const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10);

const hashPassword = async (password) => bcrypt.hash(password, 12);

const comparePassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

const signAccessToken = (payload) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL
    });
};

const createRefreshTokenPayload = (userId) => {
    const tokenId = crypto.randomUUID();
    const expiresInDays = REFRESH_TOKEN_TTL_DAYS;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    return { tokenId, expiresAt };
};

const signRefreshToken = (payload) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d`
    });
};

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const hashToken = async (token) => bcrypt.hash(token, 12);

const compareToken = async (token, tokenHash) => bcrypt.compare(token, tokenHash);

module.exports = {
    hashPassword,
    comparePassword,
    signAccessToken,
    createRefreshTokenPayload,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
    compareToken
};