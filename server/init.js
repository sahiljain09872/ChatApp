require('dotenv').config();

const User = require('./model/user.js');
const mongoose = require('mongoose');

const mongoURI = "mongodb://127.0.0.1:27017/chatsocket";

async function connectDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.log('Error connecting to MongoDB:', err.message);
    }
}

connectDB();




const sampleUsers = [
    {
        _id : new mongoose.Types.ObjectId(),
        name : 'shanu jain',
        email : "shanujain128900@gmail.com",
        password : "1234"
    }
]


const sampleChats = [
    {
        
    }
]

async function insertSampleUsers() {
    try {
        await User.insertMany(sampleUsers);
        console.log("Sample User data inserted successfully!");
    } catch (error) {
        console.error("Error inserting sample data:", error);
    } finally {
        mongoose.connection.close();
    }
}

insertSampleUsers();

