const express = require("express");
const authController = require("../controller/authController");
const chatController = require("../controller/chatController");

const chatRouter = express.Router();

chatRouter.use(authController.protect);

chatRouter.get("/getChatsWith/:targetId", chatController.getChatsWith);
chatRouter.get("/getUnreadChats", chatController.getUnreadChats);
chatRouter.get("/getOnlineUsers", chatController.getOnlineUsers);
chatRouter.patch("/markChatAsRead/:chatId", chatController.markChatAsRead);
chatRouter.get("/getLastChatTimes", chatController.getLastChatTimes);

module.exports = chatRouter;
