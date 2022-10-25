import { randomBytes } from 'crypto';
import nats, { Message } from 'node-nats-streaming';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
	url: 'http://localhost:4222',
});

stan.on('connect', () => {
	console.log(`listener connected to nats`);

	stan.on('close', () => {
		console.log('nats connection closed');
		process.exit();
	});

	const options = stan
		.subscriptionOptions()
		.setManualAckMode(true)
		.setDeliverAllAvailable()
		.setDurableName('accounting-service');

	const subcription = stan.subscribe(
		'ticket:created',
		'listenerQueueGroup',
		options
	);

	subcription.on('message', (msg: Message) => {
		const data = msg.getData();

		if (typeof data === 'string') {
			console.log(`received event #${msg.getSequence()}, with data: ${data}`);
		}

		msg.ack();
	});
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
