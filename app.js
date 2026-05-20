const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors({
	origin: true,
	credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
	res.status(200).json({
		status: 'ok',
		service: 'travel-backend',
		timestamp: new Date().toISOString()
	});
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;