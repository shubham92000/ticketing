import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentuserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler, NotFoundError } from '@ticket-mssg/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
);

app.use(currentuserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

// sync
// app.all('*', () => {
//   throw new NotFoundError();
// })

// async -> ( callback, promise, async-await )
// app.all('*', async (req, res, next) => {
//   next(new NotFoundError());
// })

// using next instead of throw is annoying
app.all('*', async (req, res) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };
