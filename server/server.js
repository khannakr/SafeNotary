import express from "express";
import mongoose from "mongoose";
import userRouter from "./Route/auth.route.js";
import cors from 'cors' 
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fileRouter from "./Route/file.route.js";
import fetchDataRouter from "./Route/getFileData.route.js";

dotenv.config();
const app = express();
const PORT = 4000;
const mongoURI = "mongodb+srv://dilpriyatk:fXyc3PuhqjANRUbw@cluster0.fy2uz.mongodb.net/Blockchain?retryWrites=true&w=majority&appName=Cluster0fXyc3PuhqjANRUbw";

app.use(cookieParser()) // use cookie for authentication
app.use(express.json())
app.use(cors()) // important

mongoose.connect("mongodb://localhost:27017/", {
})
.then(() => console.log("MongoDB connected"))
.catch((error) => console.error("MongoDB connection error:", error));

app.use('/api/auth', userRouter);
app.use('/api/file', fileRouter);
app.use('/api/fetch', fetchDataRouter);
  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}..`);
});
