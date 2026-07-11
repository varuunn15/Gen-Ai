import mongoose from "mongoose";

function connectToDb() {
    return mongoose.connect(process.env.MONGO_URL);
    console.log("Database is connected");
}

export default connectToDb;
