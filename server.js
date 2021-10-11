const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config.env` });

const http = require("http");
const mongoose = require("mongoose");
const { startSocketIOServer } = require("./socketServer.js");
const app = require("./app.js");

const server = http.createServer(app);
startSocketIOServer(server);

server.listen(process.env.PORT, () => {
    console.log(`Server running on port:${process.env.PORT}`);
});

const DB = process.env.DATABASE_CONNECT_STRING.replace(
    "<password>",
    process.env.DB_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(console.log);
