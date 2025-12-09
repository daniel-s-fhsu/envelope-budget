import express from 'express';
import { connectDb, disconnectDb } from './models/app-db.js';
import { firebaseAuthMiddleware } from './auth/firebase-implementation.js';
import monthRouter from './routes/monthRoutes.js';

const app = express();
const port = 3000;

await connectDb();

app.use(express.json());
app.use((req, res, next) => {
    const allowedOrigin = 'http://localhost:4200';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});
app.use(firebaseAuthMiddleware);

app.use('/months', monthRouter);

const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
