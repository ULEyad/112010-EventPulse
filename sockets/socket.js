const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const Message = require('../models/Message');

/**
 * Wires up all Socket.io behavior:
 *  - authenticates the socket handshake with the same JWT used by the REST API
 *  - lets a client join a room dedicated to one event ("event:<id>")
 *  - lets an admin broadcast a live announcement to that room only
 *  - persists every announcement to MongoDB via the Message model
 */
const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token is missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.user.id})`);

    socket.on('joinEvent', async (eventId) => {
      try {
        const event = await Event.findById(eventId);
        if (!event) {
          return socket.emit('errorMessage', 'Event not found');
        }
        socket.join(`event:${eventId}`);
        socket.emit('joinedEvent', eventId);
      } catch (err) {
        socket.emit('errorMessage', 'Could not join event room');
      }
    });

    socket.on('announce', async ({ eventId, text } = {}) => {
      try {
        if (socket.user.role !== 'admin') {
          return socket.emit('errorMessage', 'Only an admin can broadcast an announcement');
        }

        if (!eventId || !text || !text.trim()) {
          return socket.emit('errorMessage', 'eventId and text are required');
        }

        const event = await Event.findById(eventId);
        if (!event) {
          return socket.emit('errorMessage', 'Event not found');
        }

        const message = await Message.create({
          event: eventId,
          sender: socket.user.id,
          text: text.trim(),
        });

        const populated = await message.populate('sender', 'name role');

        // Only clients that joined this event's room receive it.
        io.to(`event:${eventId}`).emit('announcement', populated);
      } catch (err) {
        socket.emit('errorMessage', 'Could not send the announcement');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
