const Chat = require("../model/chatModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");
const { onlineUserList, userSocketMap } = require("../userSocketMap");
const AppError = require("../utils/AppError");

exports.getChatsWith = catchAsync(async (req, res, next) => {
    const id1 = mongoose.Types.ObjectId(req.params.targetId);
    const id2 = mongoose.Types.ObjectId(req.user._id);

    const chats = await Chat.find({
        $or: [
            { sender: id1, receiver: id2 },
            { sender: id2, receiver: id1 },
        ],
    }).sort({ time: 1, _id: 1 });

    await Chat.updateMany(
        { receiver: req.user._id, sender: req.params.targetId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        status: "success",
        message: "All chats",
        length: chats.length,
        chats,
    });
});

exports.getUnreadChats = catchAsync(async (req, res, next) => {
    const unreadData = await Chat.aggregate([
        {
            $match: {
                receiver: req.user._id,
                isRead: false,
            },
        },
        {
            $group: {
                _id: "$sender",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                count: 1,
                sender: "$_id",
            },
        },
    ]);

    const unreadChats = {};
    for (let { sender, count } of unreadData) {
        unreadChats[String(sender)] = count;
    }

    res.status(200).json({
        status: "success",
        message: "Unread chat count(per friend)",
        unreadChats,
    });
});

exports.getOnlineUsers = catchAsync(async (req, res, next) => {
    const onlineUsers = onlineUserList();

    res.status(200).json({
        status: "success",
        message: "All Online Friends",
        onlineUsers,
    });
});

exports.markChatAsRead = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;
    if (!(await Chat.exists({ _id: chatId, receiver: req.user._id })))
        return next(new AppError(404, "No such chat found"));
    await Chat.findOneAndUpdate(
        { _id: chatId, receiver: req.user._id },
        { isRead: true }
    );
    res.status(200).json({
        status: "success",
        message: "Chat marked as read",
    });
});

exports.getLastChatTimes = catchAsync(async (req, res, next) => {
    const lastChatTimeUnstructured = await Chat.aggregate([
        {
            $match: {
                $or: [{ receiver: req.user._id }, { sender: req.user._id }],
            },
        },
        {
            $project: {
                friend: {
                    $cond: {
                        if: { $eq: ["$sender", req.user._id] },
                        then: "$receiver",
                        else: "$sender",
                    },
                },
                time: 1,
            },
        },
        {
            $group: {
                _id: "$friend",
                lastChatTime: { $max: "$time" },
            },
        },
    ]);

    const lastChatTimes = {};
    for (let { _id, lastChatTime } of lastChatTimeUnstructured) {
        lastChatTimes[_id] = lastChatTime;
    }

    res.status(200).json({
        status: "success",
        message: "Friend wise chat times",
        size: lastChatTimeUnstructured.length,
        lastChatTimes,
    });
});
