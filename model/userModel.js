const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: [true, "An account with that email already exists"],
        required: [true, "Email required"],
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Invalid Email"],
    },
    name: { type: String, trim: true, required: [true, "Name Required"] },
    password: {
        type: String,
        minlength: 6,
        required: [true, "Password required"],
        select: false,
    },
    passwordConfirm: {
        type: String,
        select: false,
        required: [true, "Confirm Password required"],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (e) {
                return this.password === e;
            },
        },
    },
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiry: { type: Date, select: false },
    description: { type: String, maxlength: 120 },
    photo: { type: String, default: process.env.DEFAULT_USER_PROFILE_PIC },
    photoId: String,
});

userSchema.methods.didPasswordChangeAfter = function (JWTTimeStamp) {
    if (!this.passwordChangedAt) return false;
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > JWTTimeStamp;
};

userSchema.methods.isCorrectPassword = async function (
    receivedPassword,
    actualPassword
) {
    return await bcrypt.compare(receivedPassword, actualPassword);
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isNew && this.isModified("password"))
        this.passwordChangedAt = Date.now() - 1 * 1000;
    next();
});

const User = mongoose.model("user", userSchema);
module.exports = User;
