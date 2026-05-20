const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setupTestEnv, stubMethod, makeChain, createAccessToken } = require('./helpers');

setupTestEnv();

const app = require('../app');
const Destination = require('../models/destination.model');
const Review = require('../models/review.model');
const SavedDestination = require('../models/savedDestination.model');

const adminToken = createAccessToken({ roles: ['admin'] });
const userToken = createAccessToken();

test('GET /api/v1/destinations returns paginated results', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'find', () => makeChain([
        { _id: '665000000000000000000101', name: 'Blue Lagoon Beach' }
    ])));
    restoreFns.push(stubMethod(Destination, 'countDocuments', async () => 1));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app).get('/api/v1/destinations?page=1&limit=10');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.pagination.total, 1);
});

test('GET /api/v1/destinations/:id returns a destination', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'findById', () => makeChain({
        _id: '665000000000000000000101',
        name: 'Blue Lagoon Beach'
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app).get('/api/v1/destinations/665000000000000000000101');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, 'Blue Lagoon Beach');
});

test('GET /api/v1/destinations/:id/reviews returns reviews', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Review, 'find', () => makeChain([
        { _id: '665000000000000000000201', rating: 5 }
    ])));
    restoreFns.push(stubMethod(Review, 'countDocuments', async () => 1));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app).get('/api/v1/destinations/665000000000000000000101/reviews');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
});

test('POST /api/v1/destinations/:id/reviews creates a review for auth user', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'findById', async () => ({
        _id: '665000000000000000000101'
    })));
    restoreFns.push(stubMethod(Review, 'findOne', async () => null));
    restoreFns.push(stubMethod(Review, 'create', async (payload) => ({
        _id: '665000000000000000000201',
        ...payload
    })));
    restoreFns.push(stubMethod(Review, 'aggregate', async () => ([{ ratingAverage: 5, reviewCount: 1 }])));
    restoreFns.push(stubMethod(Destination, 'findByIdAndUpdate', async () => ({})));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post('/api/v1/destinations/665000000000000000000101/reviews')
        .set('Cookie', [`token=${userToken}`])
        .send({ rating: 5, comment: 'Great place' });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.rating, 5);
});

test('PUT /api/v1/destinations/:id/reviews/me updates the user review', async (t) => {
    const reviewDoc = {
        destinationId: '665000000000000000000101',
        userId: '665000000000000000000001',
        rating: 4,
        comment: 'Nice',
        save: async function save() {
            return this;
        }
    };

    const restoreFns = [];
    restoreFns.push(stubMethod(Review, 'findOne', async () => reviewDoc));
    restoreFns.push(stubMethod(Review, 'aggregate', async () => ([{ ratingAverage: 4, reviewCount: 1 }])));
    restoreFns.push(stubMethod(Destination, 'findByIdAndUpdate', async () => ({})));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .put('/api/v1/destinations/665000000000000000000101/reviews/me')
        .set('Cookie', [`token=${userToken}`])
        .send({ rating: 4, comment: 'Updated review' });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.comment, 'Updated review');
});

test('DELETE /api/v1/destinations/:id/reviews/me deletes the user review', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Review, 'findOneAndDelete', async () => ({
        destinationId: '665000000000000000000101'
    })));
    restoreFns.push(stubMethod(Review, 'aggregate', async () => ([])));
    restoreFns.push(stubMethod(Destination, 'findByIdAndUpdate', async () => ({})));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .delete('/api/v1/destinations/665000000000000000000101/reviews/me')
        .set('Cookie', [`token=${userToken}`]);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Review deleted');
});

test('POST /api/v1/destinations creates an admin destination', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'create', async (payload) => ({
        _id: '665000000000000000000101',
        ...payload
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .post('/api/v1/destinations')
        .set('Cookie', [`token=${adminToken}`])
        .send({
            name: 'Ocean View Point',
            description: 'A beautiful coastal lookout with scenic views.',
            category: 'Beach',
            location: {
                type: 'Point',
                coordinates: [120.1, 14.2]
            },
            media: [],
            tags: ['view']
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.name, 'Ocean View Point');
});

test('PUT /api/v1/destinations/:id updates an admin destination', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'findById', async () => ({ _id: '665000000000000000000101' })));
    restoreFns.push(stubMethod(Destination, 'findByIdAndUpdate', () => makeChain({
        _id: '665000000000000000000101',
        name: 'Updated Destination'
    })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .put('/api/v1/destinations/665000000000000000000101')
        .set('Cookie', [`token=${adminToken}`])
        .send({
            name: 'Updated Destination'
        });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, 'Updated Destination');
});

test('DELETE /api/v1/destinations/:id deletes an admin destination and cleanup data', async (t) => {
    const restoreFns = [];
    restoreFns.push(stubMethod(Destination, 'findByIdAndDelete', () => makeChain({ _id: '665000000000000000000101' })));
    restoreFns.push(stubMethod(Review, 'deleteMany', async () => ({ deletedCount: 1 })));
    restoreFns.push(stubMethod(SavedDestination, 'deleteMany', async () => ({ deletedCount: 1 })));

    t.after(() => restoreFns.forEach((restore) => restore()));

    const response = await request(app)
        .delete('/api/v1/destinations/665000000000000000000101')
        .set('Cookie', [`token=${adminToken}`]);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, 'Destination deleted');
});
