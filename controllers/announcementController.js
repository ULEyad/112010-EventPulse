const Event = require('../models/Event');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/events/:id/announcements
// Lets a late-joining attendee read the full announcement history of an
// event, ordered by time. Broadcasting itself happens over Socket.io
// (see sockets/socket.js) since it's a live, push-based action.
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  const announcements = await Message.find({ event: req.params.id })
    .populate('sender', 'name role')
    .sort('createdAt');

  res.status(200).json({
    status: 'success',
    results: announcements.length,
    data: { announcements },
  });
});
