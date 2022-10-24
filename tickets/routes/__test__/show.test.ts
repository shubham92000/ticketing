import request from 'supertest';
import { app } from '../../src/app';
import mongoose from 'mongoose';

it('returns a 404 if ticket is not found', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the ticket if ticket is found', async () => {
	const title = 'ticket1';
	const price = 100;

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', signin())
		.send({
			title,
			price,
		})
		.expect(201);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual(title);
	expect(ticketResponse.body.price).toEqual(price);
});
