const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const connectDatabase = require('./config/database');

dotenv.config();

const app = express();

app.use(cors({
	origin: ['http://localhost:8081', 'exp://192.168.1.7:8081'],
	credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
	res.status(200).json({
		status: 'ok',
		service: connectDatabase() ? 'connected' : 'not connected',
        database: process.env.MONGODB_URI ? 'connected' : 'not connected',
		timestamp: new Date().toISOString()
	});
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;