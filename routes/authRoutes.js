const express = require('express');
const { register, login } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration and login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new attendee account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Jane Doe }
 *               email: { type: string, example: jane@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       201: { description: User created (role defaults to attendee) }
 *       409: { description: Email already registered }
 *       422: { description: Validation error }
 */
router.post('/register', registerValidator, validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: jane@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200: { description: Login successful, returns a JWT carrying id and role }
 *       401: { description: Incorrect email or password }
 *       422: { description: Validation error }
 */
router.post('/login', loginValidator, validate, login);

module.exports = router;
