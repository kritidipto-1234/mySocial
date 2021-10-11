const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Chat must have sender"],
    },
    receiver: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Chat must have receiver"],
    },
    isRead: { type: Boolean, default: false },
    time: { type: Date, default: Date.now() },
    content: { type: String, required: [true, "Chat must have some content"] },
});

const Chat = mongoose.model("chat", chatSchema);
module.exports = Chat;
