const app = require('./app');

const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

console.log(`Connecting to MongoDB at ${process.env.MONGODB_URI}...`);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error.message}`);
    }
}

connect();


const server = app.listen(PORT, host, () => {
    console.log(`Server is running on http://${host}:${PORT}`);
});