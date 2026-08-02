const { validationResult } = require('express-validator');

/**
 * Runs after an express-validator chain. Returns a structured 422 response
 * listing every invalid field instead of letting the request continue.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'fail',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
