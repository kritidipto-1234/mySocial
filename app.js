const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoute");
// const postRouter = require("./routes/postRoute");
const chatRouter = require("./routes/chatRoute");
const friendRouter = require("./routes/friendRoute");
const path = require("path");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controller/errorController");
const config = require("./utils/config");

const app = express();

app.use(cors({ credentials: true, origin: config.client }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); //logging server request/responses

app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
// app.use("/api/posts", postRouter);
app.use("/api/friendships", friendRouter);

app.use(express.static(`${__dirname}/client/build`)); //static fontend files
app.get("*", (req, res) => {
    //no matter what give index.html
    res.sendFile(`${__dirname}/client/build/index.html`);
});

app.all("*", (req, res, next) => {
    next(new AppError(404, "No such path/route defined"));
});

app.use(globalErrorHandler);
module.exports = app;
