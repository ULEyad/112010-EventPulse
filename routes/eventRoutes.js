const express = require('express');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { createEventValidator, updateEventValidator } = require('../validators/eventValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const announcementRoutes = require('./announcementRoutes');

const router = express.Router();

// Nested route -> GET /api/events/:id/announcements
router.use('/:id/announcements', announcementRoutes);

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Browse and manage events (filtering, search, pagination, sorting)
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List events with filtering, search, sorting and pagination
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category ObjectId
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches against event name and description
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [date, registrations] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Paginated list of events (total, page, totalPages included) }
 *   post:
 *     summary: Create an event (admin only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, category, date, city, capacity]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               category: { type: string, description: Category ObjectId }
 *               date: { type: string, format: date-time }
 *               city: { type: string }
 *               capacity: { type: integer }
 *     responses:
 *       201: { description: Event created }
 *       401: { description: Missing or invalid token }
 *       403: { description: Attendees cannot create events }
 *       404: { description: Category not found }
 *       422: { description: Validation error }
 */
router
  .route('/')
  .get(getEvents)
  .post(requireAuth, requireRole('admin'), createEventValidator, validate, createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by id (category populated)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: The event }
 *       404: { description: Event not found }
 *   patch:
 *     summary: Update an event (admin only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event updated }
 *       401: { description: Missing or invalid token }
 *       403: { description: Attendees cannot update events }
 *       404: { description: Event not found }
 *       422: { description: Validation error }
 *   delete:
 *     summary: Delete an event (admin only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Event deleted }
 *       401: { description: Missing or invalid token }
 *       403: { description: Attendees cannot delete events }
 *       404: { description: Event not found }
 */
router
  .route('/:id')
  .get(getEvent)
  .patch(requireAuth, requireRole('admin'), updateEventValidator, validate, updateEvent)
  .delete(requireAuth, requireRole('admin'), deleteEvent);

module.exports = router;
