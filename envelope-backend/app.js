import express from 'express';
import { connectDb, disconnectDb } from './models/app-db.js';
import { firebaseAuthMiddleware } from './auth/firebase-implementation.js';
import monthRouter from './routes/monthRoutes.js';

const app = express();
const port = 3000;

await connectDb();

app.use(express.json());
app.use(firebaseAuthMiddleware);

app.use('/months', monthRouter);

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
