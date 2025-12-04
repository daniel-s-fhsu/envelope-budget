import mongoose from 'mongoose';
import 'dotenv/config';

export async function testMongo() {
    console.log(process.env.MONGO_CONNECTION_STRING);
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
}
