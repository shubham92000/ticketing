import { requireAuth, validateRequest } from '@ticket-mssg/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

const router = express.Router();

router.post(
	'/api/tickets',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price').isFloat({ gt: 0 }).withMessage('price is required'),
	],
	validateRequest,
	(req: Request, res: Response) => {
		res.status(200).send({});
	}
);

export { router as createTicketRouter };
