import { Subjects, Publisher, OrderCancelledEvent } from '@ticket-mssg/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
