const app = require('./app');
const connectDatabase = require('./config/database');

const PORT = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const connect = async () => {
    try {
        await connectDatabase();
        console.log('Connected to MongoDB');

        app.listen(PORT, host, () => {
            console.log(`Server is running on http://${host}:${PORT}`);
        });
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}

connect();
