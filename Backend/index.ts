import express from "express";
import * as dotenv from "dotenv"
dotenv.config();
export const app = express();











app.listen(process.env.PORT,()=>{
    console.log(`APP is Listening at port ${process.env.PORT}`)
})