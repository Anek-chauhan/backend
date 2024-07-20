import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async function database()
{
try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("DB connected");
    
} catch (error) {
    console.log(error)
    process.exit(1);
}}

export default connectDB