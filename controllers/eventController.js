const mongoose = require('mongoose');
const Event = require('../models/Event');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/events (admin only)
exports.createEvent = asyncHandler(async (req, res, next) => {
  const { name, description, category, date, city, capacity } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  const event = await Event.create({ name, description, category, date, city, capacity });
  const populated = await event.populate('category');

  res.status(201).json({ status: 'success', data: { event: populated } });
});

// GET /api/events
// Supports: category / city / date-range filters (combinable), text search
// on name+description, sorting by date or by registration count, and
// page/limit pagination with total counts.
exports.getEvents = asyncHandler(async (req, res, next) => {
  const {
    category,
    city,
    startDate,
    endDate,
    search,
    sort,
    order = 'asc',
    page = 1,
    limit = 10,
  } = req.query;

  const match = {};

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return next(new AppError('Invalid category id', 400));
    }
    match.category = new mongoose.Types.ObjectId(category);
  }

  if (city) {
    match.city = { $regex: `^${city}$`, $options: 'i' };
  }

  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  if (search) {
    match.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const sortOrder = order === 'desc' ? -1 : 1;
  let sortStage = { date: 1 };
  if (sort === 'date') sortStage = { date: sortOrder };
  if (sort === 'registrations') sortStage = { registrationsCount: sortOrder };

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'registrations',
        localField: '_id',
        foreignField: 'event',
        as: 'registrations',
      },
    },
    { $addFields: { registrationsCount: { $size: '$registrations' } } },
    { $project: { registrations: 0 } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $sort: sortStage },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limitNum }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const result = await Event.aggregate(pipeline);
  const events = result[0].data;
  const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

  res.status(200).json({
    status: 'success',
    results: events.length,
    total,
    page: pageNum,
    totalPages: Math.max(Math.ceil(total / limitNum), 1),
    data: { events },
  });
});

// GET /api/events/:id
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('category');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({ status: 'success', data: { event } });
});

// PATCH /api/events/:id (admin only)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }
  }

  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({ status: 'success', data: { event } });
});

// DELETE /api/events/:id (admin only)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
