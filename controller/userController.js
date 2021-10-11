const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../model/userModel");
const Chat = require("../model/chatModel");
const Friendship = require("../model/friendshipModel");
const FriendRequest = require("../model/friendRequestModel");
const { generateAccessToken } = require("./authController");
const multer = require("multer");
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) cb(null, true);
        else cb(new AppError(400, "Not an image"), false);
    },
    storage: multer.memoryStorage(),
});

exports.uploadUserPhoto = upload.single("photo");

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const allUsers = await User.find();

    res.status(200).json({
        status: "success",
        message: "All users",
        allUsers,
    });
});

exports.viewUserDetails = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    if (!id) return next(new AppError(400, "Give a valid id"));

    const user = await User.findById(id);
    if (!user) return next(new AppError(400, "No user found"));

    res.status(200).json({
        status: "success",
        message: "User details found",
        user,
    });
});

exports.editMyProfile = catchAsync(async (req, res, next) => {
    if (!req.body.password)
        return next(new AppError(401, "Please give ur current password"));

    const user = await User.findOne({ _id: req.user._id }).select("+password");

    if (!(await user.isCorrectPassword(req.body.password, user.password)))
        return next(new AppError(401, "Wrong password"));

    user.name = req.body.name || user.name;
    user.description = req.body.description || user.description;
    user.email = req.body.email || user.email;

    if (req.file) {
        if (user.photoId) await imagekit.deleteFile(user.photoId);
        const acknowledgement = await imagekit.upload({
            file: req.file.buffer,
            fileName: `${req.user._id}.${req.file.mimetype.split("/")[1]}`,
            folder: "mySocial",
        });
        user.photo = acknowledgement.url;
        user.photoId = acknowledgement.fileId;
    }

    await user.save({ validateModifiedOnly: true });

    user.password = undefined;
    res.status(201).json({
        status: "success",
        message: "Successfully modified user details",
        user,
    });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
    if (!req.body.password)
        return next(new AppError(400, "Give password to delete account"));

    const user = await User.findOne({ _id: req.user.id }).select("+password");
    if (!(await user.isCorrectPassword(req.body.password, user.password)))
        return next(new AppError(400, "Wrong Password"));
    await Chat.deleteMany({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });
    await FriendRequest.deleteMany({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });
    await Friendship.deleteMany({
        $or: [{ id1: req.user._id }, { id2: req.user._id }],
    });
    await User.findOneAndDelete({ _id: req.user._id });

    res.cookie("jwtToken", "random-invaid-jwt-token", {
        // httpOnly:true,
        expires: new Date(
            Date.now() + 1000 * process.env.JWT_COOKIE_EXPIRES_IN
        ),
    });
    res.status(204).json({
        status: "success",
        message: "User deleted",
    });
});
