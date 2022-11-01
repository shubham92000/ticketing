import { PaymentCreatedEvent, Publisher, Subjects } from '@ticket-mssg/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
