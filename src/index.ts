import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { AppDataSource } from './data-source';
import errorMiddleware from './middleware/errorMiddleware';
import authRoutes from './routes/auth.routes';
import orgRoutes from './routes/organisation.routes';
import userRoutes from './routes/user.routes';

// Configure dotenv to load the .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// non protected routes
app.use('/auth/', authRoutes);

// protected routes
app.use('/api/', userRoutes);
app.use('/api/', orgRoutes);

//Not found URL middleware
app.use(errorMiddleware.notFound);

//Error handler for the whole app
app.use(errorMiddleware.errorHandler);

AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
    console.log('Data Source has been initialized!');

    //initializing server
    app.listen(process.env.PORT, () => {
      console.log(`App listening on port ${process.env.PORT}`);
    });
  })
  .catch(error => console.log(error));

export default app;
