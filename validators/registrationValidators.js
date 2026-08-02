const { body } = require('express-validator');

exports.registerForEventValidator = [
  body('eventId').isMongoId().withMessage('A valid eventId is required'),
];
