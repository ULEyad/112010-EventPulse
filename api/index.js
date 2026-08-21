// Vercel serverless entry point for the REST API, Swagger docs, and health
// check.
//
// Note: Vercel serverless functions are stateless - they don't keep a
// process (or a WebSocket) alive between requests, so Socket.io real-time
// features won't work reliably through this entry point. Run `npm start`
// (server.js) locally, or deploy to a host with a persistent Node process
// (Render, Railway, Fly.io) if you need real-time announcements live too.
const app = require('../app');
const connectDB = require('../config/db');

let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    return app(req, res);
  } catch (err) {
    console.error('Vercel function failed to connect to MongoDB:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to the database.',
      detail: err.message,
    });
  }
};