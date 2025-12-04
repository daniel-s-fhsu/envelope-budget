import mongoose from 'mongoose';
import 'dotenv/config';


export async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        console.log("Connected to mongoDb");
    } catch (e) {
        console.error(`Error connection to db: ${e}`)
    }
}

export async function disconnectDb() {
    await mongoose.disconnect();
}