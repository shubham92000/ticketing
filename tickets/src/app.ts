import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@ticket-mssg/common';
import cookieSession from 'cookie-session';
import { createTicketRouter } from '../routes/new';
import { showTicketRouter } from '../routes/show';
import { indexTicketRouter } from '../routes';
import { updateTicketRouter } from '../routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
);

app.use(currentUser);
app.use(indexTicketRouter);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);

// using next instead of throw is annoying
app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
