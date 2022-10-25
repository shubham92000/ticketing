import {
	NotAuthorized,
	NotFoundError,
	requireAuth,
	validateRequest,
} from '@ticket-mssg/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../src/events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../src/nats-wrapper';

const router = express.Router();

router.put(
	'/api/tickets/:id',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Title is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be provided and must be greater than 0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorized();
		}

		ticket.set({
			title: req.body.title,
			price: req.body.price,
		});

		await ticket.save();
		await new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
		});

		res.send(ticket);
	}
);

export { router as updateTicketRouter };
