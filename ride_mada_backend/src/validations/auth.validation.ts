import { body } from 'express-validator';

export const registerValidation = [
  body('phone').isMobilePhone('any'),
  body('name').trim().isLength({ min: 2 }),
  body('password').isLength({ min: 6 }),
  body('email').optional().isEmail(),
];

export const loginValidation = [
  body('phone').notEmpty(),
  body('password').notEmpty(),
];