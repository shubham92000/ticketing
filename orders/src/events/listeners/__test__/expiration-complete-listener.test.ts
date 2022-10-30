import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { OrderStatus, ExpirationCompleteEvent } from '@ticket-mssg/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});
	await ticket.save();

	const order = Order.build({
		status: OrderStatus.Created,
		userId: 'adfew',
		expiresAt: new Date(),
		ticket,
	});
	await order.save();

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, order, ticket, data, msg };
};

it('updated the order status to be cancelled', async () => {
	const { listener, order, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an order cancelled event', async () => {
	const { listener, order, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);

	expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
	const { listener, order, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});
