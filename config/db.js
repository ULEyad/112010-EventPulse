const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the given URI, or MONGO_URI from the
 * environment by default. Throws if no URI is configured so the caller
 * (server.js) can log a clear message and exit instead of starting silently
 * with no database connection.
 */
const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error('MONGO_URI is not defined in the environment.');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected successfully.');
  return mongoose.connection;
};

module.exports = connectDB;
