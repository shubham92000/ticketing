import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

const router = express.Router();

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('email must be valid'),
  body('.password')
    .trim()
    .isLength({ min:4 , max:20 })
    .withMessage('password must be between 4 and 20 characters')
], (req: Request, res: Response) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    throw new RequestValidationError(errors.array());
  }

  const { email, password } = req.body;

  console.log('Create a new user');
  throw new DatabaseConnectionError();

  res.send({});
});

export { router as signupRouter };