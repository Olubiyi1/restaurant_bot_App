import dotenv from "dotenv"
import app from "./app.js"
dotenv.config()

app.listen(process.env.PORT,()=>{
    console.log(`server up and running on ${process.env.PORT}` );
    
})

