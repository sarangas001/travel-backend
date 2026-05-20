const jwt = require('jsonwebtoken');

const ACCESS_SECRET = 'test-access-secret';
const REFRESH_SECRET = 'test-refresh-secret';

const setupTestEnv = () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;
    process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;
    process.env.ACCESS_TOKEN_TTL = '15m';
    process.env.REFRESH_TOKEN_TTL_DAYS = '30';
};

const createAccessToken = (payload = {}) => jwt.sign(
    {
        sub: payload.sub || '665000000000000000000001',
        email: payload.email || 'jane@example.com',
        roles: payload.roles || ['user']
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
);

const createRefreshToken = (payload = {}) => jwt.sign(
    {
        sub: payload.sub || '665000000000000000000001',
        tid: payload.tid || 'token-123'
    },
    REFRESH_SECRET,
    { expiresIn: '30d' }
);

const stubMethod = (target, methodName, implementation) => {
    const original = target[methodName];
    target[methodName] = implementation;
    return () => {
        target[methodName] = original;
    };
};

const makeChain = (result) => ({
    sort() {
        return this;
    },
    skip() {
        return this;
    },
    limit() {
        return this;
    },
    populate() {
        return this;
    },
    select() {
        return this;
    },
    lean() {
        return Promise.resolve(result);
    }
});

module.exports = {
    setupTestEnv,
    createAccessToken,
    createRefreshToken,
    stubMethod,
    makeChain
};
