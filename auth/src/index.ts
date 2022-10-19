import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentuserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());

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

app.listen(3000,() => {
  console.log(`listening on port 3000!!!!!!`);
});