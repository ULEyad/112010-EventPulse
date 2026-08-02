const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API and database health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server and database connection status
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected

  res.status(200).json({
    status: 'success',
    server: 'ok',
    database: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
