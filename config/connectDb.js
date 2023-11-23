import mongoose from 'mongoose'


 export const connectDB = async () =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected...`.bgYellow.underline);
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}
// export default connectDB