import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
	const ticket = await Ticket.build({
		title: 'title',
		price: 10,
	}).save();

	const user = signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchedorder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(200);

	expect(fetchedorder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch other user orders', async () => {
	const ticket = await Ticket.build({
		title: 'title',
		price: 10,
	}).save();

	const user = signin();

	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchedorder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', signin())
		.send()
		.expect(401);
});
