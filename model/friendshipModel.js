const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
    id1: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Friendship  must have first id"],
    },
    id2: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "Friendship  must have second id"],
    },
});

const Friendship = mongoose.model("friendship", friendshipSchema);
module.exports = Friendship;
