const express = require("express");
// const socket = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

// setup express server

const app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://security-app.heroku.app"],
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

// set up routers

app.use("/article", require("./routers/articleRouter"));
app.use("/auth", require("./routers/userRouter"));
app.use("/admin", require("./routers/adminRouter"));

// connect to mongoDB

mongoose.connect(
  process.env.MDB_CONNECT_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) return console.error(err);
    console.log("Connected to MongoDB");
  }
);

// Socket programming
require('./config/socketconfig')(server);