const express = require('express');
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} = require('../controllers/registrationController');
const { registerForEventValidator } = require('../validators/registrationValidators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth); // every registration route requires a logged-in user

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Register and manage attendance for events
 */

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Register the authenticated user for an event
 *     tags: [Registrations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId: { type: string }
 *     responses:
 *       201: { description: Registration created }
 *       400: { description: Event is at capacity }
 *       401: { description: Missing or invalid token }
 *       404: { description: Event not found }
 *       409: { description: Already registered for this event }
 *       422: { description: Validation error }
 */
router.post('/', registerForEventValidator, validate, registerForEvent);

/**
 * @swagger
 * /api/registrations/me:
 *   get:
 *     summary: List the authenticated user's registrations (with event details)
 *     tags: [Registrations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of the current user's registrations }
 *       401: { description: Missing or invalid token }
 */
router.get('/me', getMyRegistrations);

/**
 * @swagger
 * /api/registrations/{id}:
 *   delete:
 *     summary: Cancel a registration owned by the authenticated user
 *     tags: [Registrations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Registration cancelled, frees a place in the event }
 *       401: { description: Missing or invalid token }
 *       403: { description: Cannot cancel another user's registration }
 *       404: { description: Registration not found }
 */
router.delete('/:id', cancelRegistration);

module.exports = router;
