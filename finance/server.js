const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectId } = require('mongodb');

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

app.post('/api/signup', async (req, res, next) => {
    const { userId, firstName, lastName, login, password } = req.body;
    const newUser = { 
        UserId: userId, 
        FirstName: firstName,
        LastName: lastName,
        Login: login,
        Password: password,
    };
    var error = '';
    try {
        const db = client.db('finance');
        const result = db.collection('Users').insertOne(newUser);
    }
    catch (e) {
        error = e.toString();
    }
    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error
    var error = '';
    const { login, password } = req.body;
    const db = client.db('finance');
    const results = await
        db.collection('Users').find({ Login: login, Password: password }).toArray();
    var id = -1;
    var fn = '';
    var ln = '';
    if (results.length > 0) {
        id = results[0].UserId;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }
    var ret = { id: id, firstName: fn, lastName: ln, error: '' };
    res.status(200).json(ret);
});

app.post('/api/addSubscription', async (req, res, next) => {
    const { userId, subscriptionName, price} = req.body;
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
        const result = db.collection('Subscriptions').deleteOne({ _id: ObjectId.createFromHexString(id)});
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

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://KaiR:COP4331@financecluster.lzo77ql.mongodb.net/?retryWrites=true&w=majority&appName=financeCluster';
const client = new MongoClient(url);
client.connect();
