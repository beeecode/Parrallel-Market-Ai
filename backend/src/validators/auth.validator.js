const { body } = require('express-validator');

const MIN_PASSWORD_LENGTH = 8;

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 160 }),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password')
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
  body('companyName').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const refreshTokenValidator = [body('refreshToken').notEmpty().withMessage('refreshToken is required.')];

module.exports = { registerValidator, loginValidator, refreshTokenValidator };
