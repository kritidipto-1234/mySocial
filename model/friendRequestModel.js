const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Friend Request must have sender"],
    },
    receiver: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Friend Request must have receiver"],
    },
});

const FriendRequest = mongoose.model("friendRequest", friendRequestSchema);
module.exports = FriendRequest;
