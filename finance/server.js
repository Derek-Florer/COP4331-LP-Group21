import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ObjectId, MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { parse } from 'path';

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
    const user = await db.collection('Users').findOne({ Login: login });
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
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
    const { userId, payment, category, method, amount, createdAt } = req.body;

    const estTime = DateTime.fromJSDate(new Date(createdAt)).setZone('America/New_York');
    const estDate = estTime.toJSDate();

    const newPayment = {
        UserId: userId,
        Payment: payment,
        Category: category,
        Method: method,
        Amount: amount,
        CreatedAt: estDate,
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

app.post('/api/loadPayments', async (req, res) => {
    const { userId, startDate, endDate } = req.body;
    const estStart = DateTime.fromISO(startDate).setZone('America/New_York').startOf('day').toJSDate();
    const estEnd = DateTime.fromISO(endDate).setZone('America/New_York').endOf('day').toJSDate();
    try {
        const db = client.db('finance');
        const payments = await db.collection('Payments').find({
            UserId: userId,
            CreatedAt: {
                $gte: estStart,
                $lte: estEnd,
            }
        }).toArray();

        res.status(200).json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load payments' });
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

app.post('/api/updatePayment', async (req, res) => {
    const { _id, Payment, Category, Method, Amount, CreatedAt } = req.body;

    const estDate = DateTime.fromISO(CreatedAt, { zone: 'utc' }) // assuming it's ISO
        .setZone('America/New_York')
        .toJSDate();

    if (!_id) {
        return res.status(400).json({ error: "Missing payment ID" });
    }

    try {
        const db = client.db('finance');
        const result = await db.collection('Payments').updateOne(
            { _id: new ObjectId(String(_id)) },
            {
                $set: {
                    Payment,
                    Category,
                    Method,
                    Amount: parseFloat(Amount), // Ensure number type
                    CreatedAt: estDate,
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Payment not found or unchanged" });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/addBudget', async (req, res, next) => {
    const { userId, month, year, amount } = req.body;
    const parsedMonth = parseInt(month);
    const estTime = DateTime.now().setZone('America/New_York');
    const estDate = estTime.toJSDate();
    const newBudget = {
        UserId: userId,
        Month: parsedMonth,
        Year: year,
        Amount: amount,
        CreatedAt: estDate,
    };
    var error = '';
    try {
        const db = client.db('finance');
        const existingBudget = await db.collection('Budgets').findOne({
            UserId: userId,
            Month: parsedMonth,
            Year: year
        });
        if (existingBudget) {
            // If the budget exists, update it
            const result = await db.collection('Budgets').updateOne(
                { _id: existingBudget._id }, // Find the existing budget by its ID
                { $set: { Amount: amount, CreatedAt: estDate } } // Update the amount and timestamp
            );
            res.status(200).json({ success: true, message: 'Budget updated successfully' });
        } else {
            // If no existing budget, create a new one
            const result = await db.collection('Budgets').insertOne(newBudget);
            res.status(200).json({ success: true, message: 'Budget created successfully' });
        }
    } catch (e) {
        error = e.toString();
    }
});

app.post('/api/getBudget', async (req, res) => {
    const { userId, month, year } = req.body;

    try {
        const db = client.db('finance');
        const budget = await db.collection('Budgets').findOne({ UserId: userId, Month: parseInt(month), Year: parseInt(year) });

        if (!budget) {
            return res.json({ amount: 0 }); // or null if you prefer
        }

        res.json({ amount: budget.Amount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/totalSpent', async (req, res) => {
    const { userId, startDate, endDate } = req.body;

    const estStart = DateTime.fromISO(startDate).setZone('America/New_York').startOf('day').toJSDate();
    const estEnd = DateTime.fromISO(endDate).setZone('America/New_York').endOf('day').toJSDate();

    try {
        const db = client.db('finance');
        const result = await db.collection('Payments').aggregate([
            {
                $match: {
                    UserId: userId,
                    CreatedAt: {
                        $gte: estStart,
                        $lte: estEnd,
                    },
                },
            },
            {
                $addFields: {
                    Amount: { $toDouble: "$Amount" }, // Ensure Amount is parsed as a float
                },
            },
            {
                $group: {
                    _id: null, // We're not grouping by any specific field, just getting the total sum
                    totalAmount: { $sum: "$Amount" },
                },
            },
        ]).toArray();
        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
        //console.log(totalAmount)
        res.status(200).json({ totalAmount }); // Returning the total sum of payments
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load payments' });
    }
});

app.post('/api/spendingByCategory', async (req, res) => {
    const { userId, category, startDate, endDate } = req.body;
    if (!userId || !category || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const estStart = DateTime.fromISO(startDate).setZone('America/New_York').startOf('day').toJSDate();
    const estEnd = DateTime.fromISO(endDate).setZone('America/New_York').endOf('day').toJSDate();
    try {
        const db = client.db('finance');
        const result = await db.collection('Payments').aggregate([
            {
                $match: {
                    UserId: userId,
                    Category: category,
                    CreatedAt: {
                        $gte: estStart,
                        $lte: estEnd,
                    },
                },
            },
            {
                $addFields: {
                    Amount: { $toDouble: "$Amount" }, // Parse string to float
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$Amount" },
                },
            },
        ]).toArray();
        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
        res.status(200).json({ totalAmount });
    } catch (err) {
        console.error("Error fetching category spend:", err);
        res.status(500).json({ error: 'Failed to load spending by category' });
    }
});

const url = process.env.MONGO_URL;
const client = new MongoClient(url);
client.connect();
