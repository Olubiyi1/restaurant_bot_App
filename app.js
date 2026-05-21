import express from "express"
import chatRoute from "./src/routes/chat.routes.js";
import paymentRoute from "./src/routes/payment.routes.js";
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())

app.get("/",(req,res)=>{
    res.json({message:"Chatbot up and running"})
    console.log("restaurant app running");
    
})
app.use("/api/chat",chatRoute)
app.use("/api/payment",paymentRoute)

export default app;