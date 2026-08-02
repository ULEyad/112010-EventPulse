// Vercel serverless entry point for the REST API, Swagger docs, and health
// check.
//
// IMPORTANT: Vercel serverless functions are stateless request/response
// handlers - they don't keep a process (or a WebSocket connection) alive
// between requests. Socket.io needs a persistent connection, so real-time
// announcements will NOT work reliably through this entry point. Use
// `npm start` (server.js) for full Socket.io support locally, or deploy to
// a host with a persistent Node process (Render, Railway, Fly.io, a plain
// VPS) if you need real-time announcements to work in production too. This
// file still satisfies the Task 7 requirement of a Vercel-deployed REST API
// with /health and /api-docs.
const app = require('../app');
const connectDB = require('../config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
