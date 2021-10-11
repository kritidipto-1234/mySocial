const express = require("express");

const userController = require("../controller/userController");
const authController = require("../controller/authController");

const userRouter = express.Router();

userRouter.post("/signUp", authController.signUp);
userRouter.post("/signIn", authController.signIn);
userRouter.post("/forgotPassword", authController.forgotPassword);
userRouter.patch("/resetPassword/:resetToken", authController.resetPassword);

userRouter.use(authController.protect);

userRouter.get("/validateLoginToken", authController.validateLoginToken);
userRouter.get("/getAllUsers", userController.getAllUsers);
userRouter.get("/getUserDetails/:id", userController.viewUserDetails);
userRouter.patch(
    "/editMyAccount",
    userController.uploadUserPhoto,
    userController.editMyProfile
);
userRouter.get("/logout", authController.logout);
userRouter.patch("/changePassword", authController.changePassword);
userRouter.delete("/deleteAccount", userController.deleteAccount);

module.exports = userRouter;
