const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

const connectDB = async () => {

    if (cached.conn) {
        console.log("Using existing MongoDB connection");
        return cached.conn;
    }

    if (!cached.promise) {

        cached.promise = mongoose
            .connect(process.env.MONGO_URI)
            .then((mongoose) => {
                console.log("MongoDB connected");
                return mongoose;
            })
            .catch((error) => {
                cached.promise = null;
                throw error;
            });
    }

    cached.conn = await cached.promise;

    return cached.conn;
};

module.exports = connectDB;