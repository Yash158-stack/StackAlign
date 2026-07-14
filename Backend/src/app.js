const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require("cors")

// Create an instance of the Express (Server) application
const app = express();

//  Middleware - used to convert the incoming JSON into JS object
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))

// require all the routes here 
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
// using all the routes here 
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

/** 
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * */ 

module.exports = app;