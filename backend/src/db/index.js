import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected !! DB HOST: 
        ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error ", error);
        process.exit(1)
    }
}

// Learning notes:  What is the difference between process.exit(1) and process.exit(0) in node.js?
// Answer: 

// Node normally exits with 0 status code when no more async operations are pending.

// The process.exit() method instructs Node.js to terminate the process synchronously with an exit status of code.
// if we pass 0 means success code and if we pass 1 then it would for failure or error code
// Calling process.exit() will force the process to exit as quickly as possible even if there are still asynchronous operations pending
// that have not yet completed fully


export default connectDB