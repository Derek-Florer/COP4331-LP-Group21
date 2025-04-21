import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ObjectId, MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-with, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000); //start Node + Express server on port 5000

const jwtSecret = process.env.JWT_SECRET;

app.post('/api/signup', async (req, res) => {
    const { userId, firstName, lastName, login, password } = req.body;

    try {
        const db = client.db('finance');
        const users = db.collection('Users');

        // Check if user already exists
        const existingUser = await users.findOne({ Login: login });
        if (existingUser) {
            return res.status(400).json({ error: 'email already in use.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            UserId: userId,
            FirstName: firstName,
            LastName: lastName,
            Login: login,
            Password: hashedPassword,
        };

        // Insert the user
        await users.insertOne(newUser);

        // Sign JWT
        const token = jwt.sign(
            { userId, email: login },
            jwtSecret || 'yourSecretKey',
            { expiresIn: '7d' }
        );

        // Return user data + token
        res.status(200).json({
            token,
            user: {
                userId,
                firstName,
                email: login,
            },
        });
    } catch (e) {
        console.error('Signup error:', e);
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: JWT token, error
    const { login, password } = req.body;
    const db = client.db('finance');
    
    // Fetch user by login (email or username)
    const user = await db.collection('Users').findOne({ Login: login });
    
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token if the login is successful
    const token = jwt.sign(
        { userId: user.UserId, firstName: user.FirstName, lastName: user.LastName },
        jwtSecret,
        { expiresIn: '1h' } // Set the expiration time (e.g., 1 hour)
    );

    // Respond with the token
    res.status(200).json({
        token: token, // JWT token
        firstName: user.FirstName,
        lastName: user.LastName
    });
});

app.post('/api/addPayment', async (req, res, next) => {
    const { userId, payment, category, method, amount } = req.body;
    const newPayment = {
        UserId: userId,
        Payment: payment,
        Category: category,
        Method: method,
        Amount: amount,
    };
    var error = '';
    try {
        const db = client.db('finance');
        const result = db.collection('Payments').insertOne(newPayment);
    }
    catch (e) {
        error = e.toString();
    }
    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/loadPayments', async (req, res, next) => {
    const { userId } = req.body;
    var error = '';
    try {
        const db = client.db('finance');
        const results = await db.collection('Payments').find({ UserId: userId }).toArray();
        var ret = results
        res.status(200).json(ret);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ results: [], error: 'Failed to fetch subscriptions.' });
    }
});

app.post('/api/removePayment', async (req, res, next) => {
    const { id } = req.body;
    var error = '';
    try {
        const db = client.db('finance');
        const result = db.collection('Payments').deleteOne({ _id: ObjectId.createFromHexString(id) });
    }
    catch (e) {
        error = e.toString();
    }
    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/addSubscription', async (req, res, next) => {
    const { userId, subscriptionName, price } = req.body;
    const newSubscription = {
        UserId: userId,
        SubscriptionName: subscriptionName,
        Price: price
    };
    var error = '';
    try {
        const db = client.db('finance');
        const result = db.collection('Subscriptions').insertOne(newSubscription);
    }
    catch (e) {
        error = e.toString();
    }
    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/removeSubscription', async (req, res, next) => {
    const { id } = req.body;
    var error = '';
    try {
        const db = client.db('finance');
        const result = db.collection('Subscriptions').deleteOne({ _id: ObjectId.createFromHexString(id) });
    }
    catch (e) {
        error = e.toString();
    }
    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/loadSubscriptions', async (req, res, next) => {
    const { userId } = req.body;
    var error = '';
    try {
        const db = client.db('finance');
        const results = await db.collection('Subscriptions').find({ UserId: userId }).toArray();

        //const subscriptions = results.map(subscription => ({
        //  subscriptionName: subscription.subscriptionName,
        //  price: subscription.price
        //}));

        var ret = results
        res.status(200).json(ret);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ results: [], error: 'Failed to fetch subscriptions.' });
    }
});

app.post('/api/searchcards', async (req, res, next) => {
    // incoming: userId, search
    // outgoing: results[], error
    var error = '';
    const { userId } = req.body;
    var _search = search.trim();
    const db = client.db('cardsApp');
    const results = await db.collection('Cards').find({ "Card": { $regex: _search + '.*' } }).toArray();
    var _ret = [];
    for (var i = 0; i < results.length; i++) {
        _ret.push(results[i].Card);
    }
    var ret = { results: _ret, error: error };
    res.status(200).json(ret);
});

const url = process.env.MONGO_URL;
const client = new MongoClient(url);
client.connect();
