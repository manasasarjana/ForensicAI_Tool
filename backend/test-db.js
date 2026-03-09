require('dotenv').config();
const mongoose = require('mongoose');

async function checkDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const User = require('./models/User');
    const investigator = await User.findOne({ role: 'investigator' });
    console.log('Investigator Email:', investigator.email);

    process.exit(0);
}

checkDB();
