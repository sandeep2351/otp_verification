import mongoose from "mongoose";
import env from "../config.js";

async function connect() {
    try {
        // Ensure MONGO_URI is not undefined or missing
        if (!env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in config.js");
        }

        // Connect to MongoDB using the URI and connection options
        await mongoose.connect(env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Database is connected");
    } catch (error) {
        console.log("Database connection failed:", error);
    }
}

export default connect;
