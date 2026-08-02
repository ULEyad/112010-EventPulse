const express = require('express');
const { getAnnouncements } = require('../controllers/announcementController');
const requireAuth = require('../middleware/requireAuth');

// mergeParams so this router can read :id from the parent /api/events/:id mount
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/events/{id}/announcements:
 *   get:
 *     summary: Get the announcement history of an event, ordered by time
 *     tags: [Announcements]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Announcements for this event, oldest first }
 *       401: { description: Missing or invalid token }
 *       404: { description: Event not found }
 */
router.get('/', requireAuth, getAnnouncements);

module.exports = router;
