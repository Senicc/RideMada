import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail(),
];