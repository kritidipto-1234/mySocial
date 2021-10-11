const express = require("express");
const authController = require("../controller/authController");
const friendController = require("../controller/friendController");

const friendRouter = express.Router();

friendRouter.use(authController.protect);

friendRouter.get("/getAllFriends", friendController.getAllFriends);
friendRouter.get("/getAllFriendNames", friendController.getAllFriendNames);
friendRouter.get("/getAllNonFriends", friendController.getAllNonFriends);
friendRouter.delete("/deleteFriend", friendController.deleteFriend);

friendRouter.post("/sendFriendRequest", friendController.sendFriendRequest);
friendRouter.get(
    "/getPendingFriendRequests",
    friendController.getPendingFriendRequests
);
friendRouter.post(
    "/acknowledgeFriendRequest/:requestId",
    friendController.acknowledgeFriendRequest
);

module.exports = friendRouter;
