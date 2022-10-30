import {
	ExpirationCompleteEvent,
	Publisher,
	Subjects,
} from '@ticket-mssg/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
