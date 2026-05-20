const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setupTestEnv } = require('./helpers');

setupTestEnv();

const app = require('../app');

test('GET / returns ok', async () => {
    const response = await request(app).get('/');

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.body.service, 'travel-backend');
});

test('GET unknown route returns 404', async () => {
    const response = await request(app).get('/does-not-exist');

    assert.equal(response.status, 404);
    assert.match(response.body.message, /Route not found/i);
});
