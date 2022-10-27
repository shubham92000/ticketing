import { Publisher, OrderCreatedEvent, Subjects } from '@ticket-mssg/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
