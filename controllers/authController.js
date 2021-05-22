const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.login = catchAsync(async (req, res, next) => {
    const { username } = req.body;
    if (!username) {
        throw new AppError("Invalid username", 400);
    }
    const user = await User.create({ username });
    const token = jwt.sign(
        {
            username,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return res.status(201).send({
        status: "success",
        token,
    });
});

exports.logout = async (username) => {
    const tour = await User.findOneAndDelete({ username });
    if (!tour) console.log(`Failed to logout ${username}`);
    else console.log(`'${username}' logged out`);
};
