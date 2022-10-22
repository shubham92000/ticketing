import { CustomError } from './custom-error';

class NotAuthorized extends CustomError {
	statusCode = 401;
	constructor() {
		super('Not Authorized');

		Object.setPrototypeOf(this, NotAuthorized.prototype);
	}

	serializeErrors() {
		return [{ message: 'Not Authorized' }];
	}
}

export { NotAuthorized };
