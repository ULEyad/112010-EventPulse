const { body } = require('express-validator');

exports.createEventValidator = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Event description is required'),
  body('category').isMongoId().withMessage('A valid category id is required'),
  body('date').isISO8601().withMessage('A valid ISO 8601 date is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

exports.updateEventValidator = [
  body('name').optional().trim().notEmpty().withMessage('Event name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Event description cannot be empty'),
  body('category').optional().isMongoId().withMessage('A valid category id is required'),
  body('date').optional().isISO8601().withMessage('A valid ISO 8601 date is required'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];
