const Chat = require("../model/chatModel");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const {
    userSocketMap,
    addUserSocket,
    removeUserSocket,
    onlineUserList,
} = require("../userSocketMap");
const { fetchFriends } = require("./friendController");

saveChat = async ({ sender, receiver, content, time }) => {
    const newChat = await Chat.create({
        sender,
        receiver,
        content,
        time: time || new Date(),
    });

    return newChat;
};

authenticateUser = async (jwtToken) => {
    if (!jwtToken)
        return {
            type: "auth_error",
            message: "Send jwtToken for authentication",
        };
    let decoded;
    try {
        decoded = jwt.verify(jwtToken, process.env.JWT_SECRET_STRING);
    } catch (e) {
        return { type: "auth_error", message: e.message || "invalid jwt" };
    }

    const user = await User.findOne({ _id: decoded.id });
    if (!user)
        return { type: "auth_error", message: "User doesnt exist anymore" };

    if (user.didPasswordChangeAfter(decoded.iat))
        return { type: "auth_error", message: "Password changed recently" };

    return user;
};

exports.connectionInitiator = async (socket, next) => {
    const result = await authenticateUser(socket.handshake.auth.jwtToken);
    if (result.type === "auth_error") return next(result);

    addUserSocket(result, socket);
    // console.log(`${result._id} connected to Socket : ${socket.id}`);
    console.log(userSocketMap, "\n");
    next();
};

exports.chatMessageHandler = async (data, socket, io) => {
    const result = await authenticateUser(data.auth.jwtToken);
    if (result.type === "auth_error") return socket.emit("auth_error", result);

    const { msg } = data;

    if (String(result._id) !== String(msg.sender))
        return socket.emit("auth_error", {
            type: "auth_error",
            message: "Sender unauthorised.",
        });

    const friends = await fetchFriends(result._id);
    if (!friends.includes(String(msg.receiver)))
        return socket.emit("auth_error", {
            message: "You can only message your friends",
        });

    const newMsg = await saveChat(msg);

    const receiverSockets = userSocketMap.get(String(msg.receiver)) || [];
    for (let s of receiverSockets) io.to(s).emit("chatMessage", newMsg);

    const senderSockets = userSocketMap.get(String(msg.sender)) || [];
    for (let s of senderSockets) {
        if (s !== socket.id) io.to(s).emit("chatMessage", newMsg);
    }
};

exports.disconnectHandler = async (socket, io) => {
    removeUserSocket(socket);
    // console.log(`A user disconnected from Socket : ${socket.id}`);
    console.log(userSocketMap, "\n");
    io.emit("updateOnlineUserList", onlineUserList());
};
