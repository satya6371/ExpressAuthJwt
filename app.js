import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import {connectDB} from './config/connectDb.js'
import colors from 'colors'
import userRoute from './routes/userRoute.js'

const app = express()
const port = process.env.PORT

// Database Connection
connectDB()

// Body parser middleware
app.use(express.json())

// Routes load
app.use('/api/user',userRoute)


app.listen(port,()=>{
    console.log(`Server running at port http://localhost:${port}`)
})