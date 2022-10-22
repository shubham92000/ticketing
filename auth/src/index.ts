import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentuserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: true
}));

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
app.all('*',async (req, res) => {
  throw new NotFoundError();
})

app.use(errorHandler);

const start = async () => {
  try {
    if(!process.env.JWT_KEY){
      throw new Error('JWT_KEY must be defined');
    }
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to auth mongodb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000,() => {
    console.log(`listening on port 3000!!!!!!`);
  });
};

start();