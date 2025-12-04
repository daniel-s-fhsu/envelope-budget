import express from 'express';
import { testMongo } from './data/app-db.js';

const app = express();
const port = 3000;

testMongo();

app.get('/', (req,res) => {
    res.send("Hello world");
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
