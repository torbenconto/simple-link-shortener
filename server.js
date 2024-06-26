import express from 'express';
import cors from 'cors';
import mongodb from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const client = new mongodb.MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let collection;

const connectToDb = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB!');
        collection = client.db('rift').collection('links');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit the application if the database connection fails
    }
};

const generateKey = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 6;
    let shortLink = '';

    for (let i = 0; i < length; i++) {
        shortLink += charset[Math.floor(Math.random() * charset.length)];
    }

    return shortLink;
};

const registerLink = async (longLink) => {
    while (true) {
        const shortLink = generateKey();
        const count = await collection.countDocuments({ shortKey: shortLink });

        if (count === 0) {
            await collection.insertOne({ shortKey: shortLink, long: longLink });
            return shortLink;
        }
    }
};

app.post('/create', async (req, res) => {
    try {
        const { url: originalURL } = req.body;

        if (!originalURL) {
            return res.status(400).send('URL is required');
        }

        const shortLink = await registerLink(originalURL);
        res.send(shortLink);
    } catch (error) {
        console.error('Error creating short link:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/:shortKey', async (req, res) => {
    try {
        const { shortKey } = req.params;

        if (!shortKey) {
            return res.status(400).send('Short link is required');
        }

        const result = await collection.findOne({ shortKey });

        if (!result) {
            return res.status(404).send('Link not found');
        }

        res.redirect(result.long);
    } catch (error) {
        console.error('Error retrieving short link:', error);
        res.status(500).send('Internal Server Error');
    }
});

const startServer = async () => {
    await connectToDb();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();
