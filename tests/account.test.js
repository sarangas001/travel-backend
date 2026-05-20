const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setupTestEnv, stubMethod, createAccessToken } = require('./helpers');

setupTestEnv();

const app = require('../app');
const User = require('../models/user.model');

const token = createAccessToken();

test('GET /api/v1/account/me returns the authenticated profile', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(User, 'findById', () => ({
        select() {
            return {
                lean: async () => ({
                    _id: '665000000000000000000001',
                    username: 'jane_doe',
                    email: 'jane@example.com',
                    profile: { firstName: 'Jane', lastName: 'Doe', avatarUrl: '' },
                    roles: ['user']
                })
            };
        }
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .get('/api/v1/account/me')
        .set('Cookie', [`token=${token}`]);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.username, 'jane_doe');
});

test('PUT /api/v1/account/me updates the authenticated profile', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(User, 'findByIdAndUpdate', () => ({
        select() {
            return {
                lean: async () => ({
                    _id: '665000000000000000000001',
                    username: 'jane_doe',
                    email: 'jane@example.com',
                    profile: { firstName: 'Jane', lastName: 'Smith', avatarUrl: '' },
                    roles: ['user']
                })
            };
        }
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .put('/api/v1/account/me')
        .set('Cookie', [`token=${token}`])
        .send({
            lastName: 'Smith'
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.profile.lastName, 'Smith');
});
