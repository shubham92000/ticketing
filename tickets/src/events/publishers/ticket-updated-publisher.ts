import { Publisher, Subjects, TicketUpdatedEvent } from '@ticket-mssg/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
