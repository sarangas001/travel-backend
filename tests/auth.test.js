const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { setupTestEnv, stubMethod, createRefreshToken, createAccessToken } = require('./helpers');

setupTestEnv();

const app = require('../app');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { hashToken } = require('../utils/auth');

const authBase = '/api/v1/auth';

test('POST /api/v1/auth/register creates a user and returns tokens', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(User, 'findOne', async () => null));
    restoreFns.push(stubMethod(User, 'create', async (payload) => ({
        _id: '665000000000000000000001',
        username: payload.username,
        email: payload.email,
        profile: payload.profile || {},
        roles: payload.roles || ['user']
    })));
    restoreFns.push(stubMethod(RefreshToken, 'create', async (payload) => payload));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post(`${authBase}/register`)
        .send({
            username: 'jane_doe',
            email: 'jane@example.com',
            password: 'Password123!'
        });

    assert.equal(response.status, 201);
    assert.ok(response.body.accessToken);
    assert.ok(response.body.refreshToken);
    assert.equal(response.body.user.email, 'jane@example.com');
    assert.deepEqual(response.body.user.roles, ['user']);
});

test('POST /api/v1/auth/login returns tokens for valid credentials', async (t) => {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    const restoreFns = [];
    restoreFns.push(stubMethod(User, 'findOne', async () => ({
        _id: '665000000000000000000001',
        username: 'jane_doe',
        email: 'jane@example.com',
        passwordHash,
        profile: { firstName: 'Jane', lastName: 'Doe', avatarUrl: '' },
        roles: ['user']
    })));
    restoreFns.push(stubMethod(RefreshToken, 'create', async (payload) => payload));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post(`${authBase}/login`)
        .send({
            email: 'jane@example.com',
            password: 'Password123!'
        });

    assert.equal(response.status, 200);
    assert.ok(response.body.accessToken);
    assert.ok(response.body.refreshToken);
    assert.equal(response.body.user.username, 'jane_doe');
});

test('POST /api/v1/auth/refresh rotates tokens', async (t) => {
    const refreshToken = createRefreshToken();
    const tokenHash = await hashToken(refreshToken);
    const restoreFns = [];
    restoreFns.push(stubMethod(RefreshToken, 'findOne', async () => ({
        tokenHash,
        revokedAt: null,
        save: async function save() {
            this.revokedAt = new Date();
            return this;
        }
    })));
    restoreFns.push(stubMethod(User, 'findById', async () => ({
        _id: '665000000000000000000001',
        username: 'jane_doe',
        email: 'jane@example.com',
        profile: { firstName: 'Jane', lastName: 'Doe', avatarUrl: '' },
        roles: ['user']
    })));
    restoreFns.push(stubMethod(RefreshToken, 'create', async (payload) => payload));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post(`${authBase}/refresh`)
        .send({ refreshToken });

    assert.equal(response.status, 200);
    assert.ok(response.body.accessToken);
    assert.ok(response.body.refreshToken);
});

test('POST /api/v1/auth/logout accepts a refresh token', async (t) => {
    const refreshToken = createRefreshToken();
    const restoreFns = [];
    restoreFns.push(stubMethod(RefreshToken, 'findOne', async () => ({
        revokedAt: null,
        save: async function save() {
            this.revokedAt = new Date();
            return this;
        }
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post(`${authBase}/logout`)
        .send({ refreshToken });

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Logged out successfully');
});
