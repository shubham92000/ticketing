import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@ticket-mssg/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('ticket id must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;
		// find the ticker the user is trying to order in db
		const ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}

		// make sure that ticket is not already reserved
		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// calcaulate expiration date
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		// build the order and save it to db
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		});
		await order.save();

		// publish an event for order created
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		});

		res.status(201).send(order);
	}
);

export { router as newOrderRouter };
