import { Listener, OrderCreatedEvent, Subjects } from '@ticket-mssg/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		// find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket) {
			throw new Error('Ticket not found');
		}
		// mark ticket as reserved
		ticket.set({ orderId: data.id });
		await ticket.save();

		// ack
		msg.ack();
	}
}
