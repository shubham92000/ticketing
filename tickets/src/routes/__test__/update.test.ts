import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', signin())
		.send({
			title: 'fdewf',
			price: 200,
		})
		.expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'fdewf',
			price: 200,
		})
		.expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', signin())
		.send({
			title: 'adfwrg',
			price: 200,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', signin())
		.send({
			title: 'swdq',
			price: 2000,
		})
		.expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
	const cookie = signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'adfwrg',
			price: 200,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'rgrwhtrje',
			price: -20,
		})
		.expect(400);
});

it('updates the ticket provided valid inputs', async () => {
	const cookie = signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'adfwrg',
			price: 200,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 1000,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send();

	expect(ticketResponse.body.title).toEqual('new title');
	expect(ticketResponse.body.price).toEqual(1000);
});

it('published an event', async () => {
	const cookie = signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'adfwrg',
			price: 200,
		});

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 1000,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if the ticket is reserved', async () => {
	const cookie = signin();
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'adfwrg',
			price: 200,
		});

	const ticket = await Ticket.findById(response.body.id);

	ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });

	await ticket!.save();

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'new title',
			price: 1000,
		})
		.expect(400);
});
