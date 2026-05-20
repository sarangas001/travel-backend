const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setupTestEnv, stubMethod, makeChain, createAccessToken } = require('./helpers');

setupTestEnv();

const app = require('../app');
const SavedDestination = require('../models/savedDestination.model');
const Destination = require('../models/destination.model');

const token = createAccessToken();

test('GET /api/v1/saved-places returns the user saved places', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(SavedDestination, 'find', () => makeChain([
        {
            _id: '665000000000000000000301',
            createdAt: '2026-05-20T00:00:00.000Z',
            destinationId: {
                _id: '665000000000000000000101',
                name: 'Blue Lagoon Beach'
            }
        }
    ])));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .get('/api/v1/saved-places')
        .set('Cookie', [`token=${token}`]);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].destination.name, 'Blue Lagoon Beach');
});

test('POST /api/v1/saved-places saves a destination', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'findById', () => makeChain({ _id: '665000000000000000000101' })));
    restoreFns.push(stubMethod(SavedDestination, 'findOne', async () => null));
    restoreFns.push(stubMethod(SavedDestination, 'create', async (payload) => ({
        _id: '665000000000000000000301',
        ...payload
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post('/api/v1/saved-places')
        .set('Cookie', [`token=${token}`])
        .send({ destinationId: '665000000000000000000101' });

    assert.equal(response.status, 201);
    assert.equal(response.body.message, 'Destination saved');
});

test('DELETE /api/v1/saved-places/:destinationId unsaves a destination', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(SavedDestination, 'findOneAndDelete', async () => ({
        _id: '665000000000000000000301'
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .delete('/api/v1/saved-places/665000000000000000000101')
        .set('Cookie', [`token=${token}`]);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Destination unsaved');
});
