const { Server } = require("socket.io");
const socketController = require("./controller/socketController");
const { onlineUserList } = require("./userSocketMap");
const config = require("./utils/config");

let io;

function startSocketIOServer(server) {
    io = new Server(server, {
        cors: {
            origin: config.client,
            methods: ["GET", "POST"],
        },
    });

    io.use(socketController.connectionInitiator);

    io.on("connection", async (socket) => {
        socket.broadcast.emit("updateOnlineUserList", onlineUserList());

        socket.on("chatMessage", (data) =>
            socketController.chatMessageHandler(data, socket, io)
        );

        socket.on("disconnect", () =>
            socketController.disconnectHandler(socket, io)
        );

        socket.on("reconnect", () => console.log(`${socket.id} reconnected`));
    });

    console.log("Socket.io server created");
}

exports.startSocketIOServer = startSocketIOServer;
