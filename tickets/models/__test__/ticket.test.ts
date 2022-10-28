import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
	// create an instance of ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '132',
	});

	// save ticket to db
	await ticket.save();

	// fetch ticket twice
	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	// make two seperate changes to the tickets fetched
	firstInstance!.set({ price: 10 });
	secondInstance!.set({ price: 15 });

	// save fist ticket
	await firstInstance!.save();

	// save the second ticket and expect an error
	try {
		await secondInstance!.save();
	} catch (err) {
		return;
	}

	throw new Error('should not reach this point');
});

it('increments the version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	});

	await ticket.save();
	expect(ticket.version).toEqual(0);

	await ticket.save();
	expect(ticket.version).toEqual(1);

	await ticket.save();
	expect(ticket.version).toEqual(2);
});
