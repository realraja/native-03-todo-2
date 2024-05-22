import mongoose from "mongoose"


export const connectDB = async () =>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connection successful', connection.host);
    } catch (error) {
        console.log('err===>',error);
        process.exit(1);
    }
}