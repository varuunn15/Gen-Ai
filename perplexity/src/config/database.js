import mongoose from "mongoose";

function connectToDb() {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Database is connected");
        })
        .catch((err) => {
            console.log("Error connecting to DB:", err);
        });
}

export default connectToDb;