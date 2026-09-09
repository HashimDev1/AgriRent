const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is not set in environment variables!');
    return;
  }

  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  try {
    isConnecting = true;
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnecting = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnecting = false;
    console.error(`❌ Database connection error: ${error.message}`);
    if (
      error.message &&
      (error.message.includes('whitelist') ||
        error.message.includes('not whitelisted') ||
        error.message.includes('Could not connect to any servers'))
    ) {
      console.error('⚠️  ACTION REQUIRED IN MONGODB ATLAS:');
      console.error('   1. Log into https://cloud.mongodb.com/');
      console.error('   2. Go to "Network Access" under Security in the left sidebar.');
      console.error('   3. Click "+ Add IP Address" -> Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
      console.error('   4. Click "Confirm". Once saved, the server will connect automatically.');
    }
    // Retry connection after 5 seconds instead of crashing the server process
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

