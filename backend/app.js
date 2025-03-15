const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const path = require("path");
const authRoute = require("./routes/authRoute");
const pollRoute = require("./routes/pollRoute");
const questionRoute = require("./routes/questionRoute");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
dbConnect();
app.use(
  cors({
    origin: [
      "http://localhost:3001","http://localhost:3000", 
      "https://blog-beta-seven-98.vercel.app/",
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
  })
);



app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/polls", pollRoute);
app.use("/questions", questionRoute);

app.listen(5000, () => {
  console.log("server is running");
});
