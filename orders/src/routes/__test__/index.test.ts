import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('fetches orders for a particular user', async () => {
	const ticketOne = await Ticket.build({
		title: 'concert',
		price: 20,
	}).save();
	const ticketTwo = await Ticket.build({
		title: 'concert',
		price: 20,
	}).save();
	const ticketThree = await Ticket.build({
		title: 'concert',
		price: 20,
	}).save();

	const userOne = signin();
	const userTwo = signin();

	await request(app)
		.post('/api/orders')
		.set('Cookie', userOne)
		.send({ ticketId: ticketOne.id })
		.expect(201);

	// rename when destructured
	const { body: orderOne } = await request(app)
		.post('/api/orders')
		.set('Cookie', userTwo)
		.send({ ticketId: ticketTwo.id })
		.expect(201);

	const { body: orderTwo } = await request(app)
		.post('/api/orders')
		.set('Cookie', userTwo)
		.send({ ticketId: ticketThree.id })
		.expect(201);

	const response = await request(app)
		.get('/api/orders')
		.set('Cookie', userTwo)
		.expect(200);

	expect(response.body.length).toEqual(2);
	expect(response.body[0].id).toEqual(orderOne.id);
	expect(response.body[1].id).toEqual(orderTwo.id);
	expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
	expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
