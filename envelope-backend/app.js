import express from 'express';
import { connectDb, disconnectDb } from './models/app-db.js';

// router imports
import monthRouter from './routes/monthRoutes.js';

const app = express();
const port = 3000;

await connectDb();

app.use(express.json());

app.use('/months', monthRouter)

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

