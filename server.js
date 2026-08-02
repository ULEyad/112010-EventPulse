require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

initSocket(io);

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`EventPulse API listening on port ${PORT}`);
    console.log(`Docs:   http://localhost:${PORT}/api-docs`);
    console.log(`Health: http://localhost:${PORT}/health`);
  });
};

start();

module.exports = server;
