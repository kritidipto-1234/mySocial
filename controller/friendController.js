const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Friendship = require("../model/friendshipModel");
const FriendRequest = require("../model/friendRequestModel");
const User = require("../model/userModel");
const Chat = require("../model/chatModel");

exports.fetchFriends = async (userId) => {
    const allFriendships = await Friendship.find({
        $or: [{ id1: userId }, { id2: userId }],
    });

    const friends = [];

    for (let { id1, id2 } of allFriendships) {
        id1 = String(id1);
        id2 = String(id2);
        if (id1 === String(userId)) friends.push(id2);
        else if (id2 === String(userId)) friends.push(id1);
    }

    return friends;
};

exports.getAllFriends = catchAsync(async (req, res, next) => {
    const friends = await exports.fetchFriends(req.user._id);

    res.status(200).json({
        friends,
        status: "success",
        message: "All friends",
    });
});

exports.getAllFriendNames = catchAsync(async (req, res, next) => {
    const friendships = await Friendship.find({
        $or: [{ id1: req.user._id }, { id2: req.user._id }],
    }).populate("id1 id2");

    const friendNames = {};

    for (let f of friendships) {
        if (String(req.user._id) === String(f.id1._id))
            friendNames[f.id2._id] = f.id2.name.toLowerCase();
        if (String(req.user._id) === String(f.id2._id))
            friendNames[f.id1._id] = f.id1.name.toLowerCase();
    }

    res.status(200).json({
        friendNames,
        status: "success",
        message: "All friends",
    });
});

exports.getAllNonFriends = catchAsync(async (req, res, next) => {
    const allUsers = await User.find();
    const friends = await exports.fetchFriends(req.user._id);
    const pendingRequesters = (
        await FriendRequest.find({
            $or: [{ receiver: req.user._id }, { sender: req.user._id }],
        })
    ).map(({ sender, receiver }) =>
        String(sender) === String(req.user._id)
            ? String(receiver)
            : String(sender)
    );
    const nonFriends = [];

    for (let u of allUsers) {
        if (u._id.equals(req.user._id)) continue;
        if (
            !friends.includes(String(u._id)) &&
            !pendingRequesters.includes(String(u._id))
        )
            nonFriends.push(u._id);
    }

    res.status(200).json({
        nonFriends,
        status: "success",
        message: "All non-friends",
    });
});

exports.deleteFriend = catchAsync(async (req, res, next) => {
    const filterObj = {
        $or: [
            { id1: req.user._id, id2: req.body.friendId },
            { id2: req.user._id, id1: req.body.friendId },
        ],
    };
    if (!(await Friendship.exists(filterObj)))
        return next(new AppError(404, "Friendship doesnt exist"));

    await Friendship.deleteOne(filterObj);
    await Chat.deleteMany({
        $or: [
            { sender: req.user._id, receiver: req.body.friendId },
            { receiver: req.user._id, sender: req.body.friendId },
        ],
    });
    res.status(200).json({
        status: "success",
        message: "Friend deleted",
    });
});

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { targetId } = req.body;
    if (!(await User.exists({ _id: targetId })))
        return next(new AppError(400, "No such user"));

    if (userId.equals(targetId))
        return next(new AppError(400, "Cant send request to yourself"));

    if (
        await Friendship.exists({
            $or: [
                { id1: userId, id2: targetId },
                { id1: targetId, id2: userId },
            ],
        })
    )
        return next(new AppError(400, "Friendship already exists"));

    if (await FriendRequest.exists({ sender: targetId, receiver: userId }))
        return next(new AppError(400, "User already send you a request "));

    if (await FriendRequest.exists({ sender: userId, receiver: targetId }))
        return next(new AppError(400, "Request already pending"));

    const newRequest = await FriendRequest.create({
        sender: userId,
        receiver: targetId,
    });

    res.status(200).json({
        status: "success",
        message: "Friend request send",
        newRequest,
    });
});

exports.getPendingFriendRequests = catchAsync(async (req, res, next) => {
    const pendingRequests = await FriendRequest.find({
        receiver: req.user._id,
    });

    res.status(200).json({
        status: "success",
        message: "All pending requests",
        pendingRequests,
    });
});

exports.acknowledgeFriendRequest = catchAsync(async (req, res, next) => {
    const request = await FriendRequest.findOne({
        _id: req.params.requestId,
        receiver: req.user._id,
    });
    if (!request) return next(new AppError(404, "No such request found"));

    if (req.body.type === "accept") {
        await Friendship.create({
            id1: request.sender,
            id2: request.receiver,
        });
        await FriendRequest.deleteOne({ _id: request._id });
        res.status(200).json({
            status: "success",
            message: "Friend request accepted",
        });
    }

    if (req.body.type === "reject") {
        await FriendRequest.deleteOne({ _id: request._id });
        res.status(200).json({
            status: "success",
            message: "Friend request rejected",
        });
    }

    if (req.body.type !== "accept" && req.body.type !== "reject") {
        return next(new AppError(404, "Acknowledge type can be accept/reject"));
    }
});
