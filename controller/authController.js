const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const util = require("util");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const config = require("../utils/config");

exports.generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_STRING, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        description: req.body.description,
        passwordConfirm: req.body.passwordConfirm,
        photo: req.body.photo,
    });

    user.password = undefined;

    const jwtToken = exports.generateAccessToken({ id: user._id });

    res.cookie("jwtToken", jwtToken, {
        expires: new Date(
            Date.now() + 1000 * process.env.JWT_COOKIE_EXPIRES_IN
        ),
        // secure: true,
        // httpOnly: true,
    });

    res.status(200).json({
        user,
        status: "success",
        message: "New User created successfully",
        jwtToken,
    });
});

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new AppError(404, "Please enter a valid email & password"));

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password, user.password)))
        return next(new AppError(401, "Invalid emailID/password"));

    const jwtToken = exports.generateAccessToken({ id: user._id });
    user.password = undefined;

    res.cookie("jwtToken", jwtToken, {
        expires: new Date(
            Date.now() + 1000 * process.env.JWT_COOKIE_EXPIRES_IN
        ),
        // secure: true,
        // httpOnly: true,
    });

    res.status(200).json({
        status: "success",
        message: "Login successful",
        jwtToken,
        user,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let jwtToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    )
        jwtToken = req.headers.authorization.split(" ")[1];

    jwtToken = jwtToken || req.cookies.jwtToken;

    if (!jwtToken) return next(new AppError(401, "Not logged in"));

    const decoded = await util.promisify(jwt.verify)(
        jwtToken,
        process.env.JWT_SECRET_STRING
    );

    const user = await User.findOne({ _id: decoded.id }).select(
        "+passwordChangedAt"
    );
    if (!user) return next(new AppError(400, "User doesnt exist anymore "));

    if (user.didPasswordChangeAfter(decoded.iat))
        return next(new AppError(401, "Recently Password changed"));

    req.user = user;
    next();
});

exports.validateLoginToken = catchAsync(async (req, res, next) => {
    const jwtToken = exports.generateAccessToken({ id: req.user._id });

    res.cookie("jwtToken", jwtToken, {
        expires: new Date(
            Date.now() + 1000 * process.env.JWT_COOKIE_EXPIRES_IN
        ),
        // secure: true,
        // httpOnly: true,
    });

    req.user.passwordChangedAt = undefined;

    res.status(200).json({
        status: "success",
        message: "Auto Login successful(using jwt token)",
        jwtToken,
        user: req.user,
    });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError(400, "Invalid Email ID"));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.client}/resetPassword/${resetToken}`;
    const message = `Reset Password link : ${resetUrl} (Valid for only 10 mins)`;
    const subject = "MySocial Password reset link ";

    try {
        await sendEmail({ email: user.email, subject, message });

        res.status(200).json({
            status: "success",
            message: "Reset link send to the email",
        });
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        user.save({ validateBeforeSave: false });
        return next(new AppError(500, "Error sending Email"));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const passwordResetToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken,
        passwordResetTokenExpiry: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetTokenExpiry");

    if (!user) return next(new AppError(400, "Invalid/Expired Token"));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save();
    res.status(201).json({
        status: "success",
        message: "Password changed",
    });
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.isCorrectPassword(oldPassword, user.password)))
        return next(new AppError(401, "Enter valid password"));

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    const jwtToken = exports.generateAccessToken({ id: user._id });

    res.cookie("jwtToken", jwtToken, {
        expires: new Date(
            Date.now() + 1000 * process.env.JWT_COOKIE_EXPIRES_IN
        ),
        // secure: true,
        // httpOnly: true,
    });

    res.status(200).json({
        status: "success",
        message: "Password changed successfully",
        jwtToken,
    });
});

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie("jwtToken", "random-invalid-jwt-logout-token", {
        expires: new Date(
            Date.now() + 1000 * process.env.JWT_COOKIE_EXPIRES_IN
        ),
        // secure: true,
        // httpOnly: true,
    });
    res.status(200).json({
        status: "success",
        message: "You logged out",
        jwtToken: "random-invaid-jwt-token",
    });
});
