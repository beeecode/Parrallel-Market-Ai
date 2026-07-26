const { body } = require('express-validator');

const MIN_PASSWORD_LENGTH = 8;

const updateProfileValidator = [
  body('fullName').optional().trim().isLength({ min: 1, max: 160 }).withMessage('Full name must not be empty.'),
  body('companyName').optional({ values: 'falsy' }).trim().isLength({ max: 160 }),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 32 }),
  body('avatar').optional({ values: 'falsy' }).trim().isURL().withMessage('avatar must be a valid URL.'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
];

module.exports = { updateProfileValidator, changePasswordValidator };
