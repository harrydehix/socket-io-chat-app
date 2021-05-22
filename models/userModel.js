const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        unique: [true, "Username already taken"],
        required: [true, "Username is required"],
        validate: {
            validator: function (value) {
                return (
                    /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
                        value
                    ) && value !== "You"
                );
            },
            message: "Invalid username ({VALUE})",
        },
    },
});

module.exports = mongoose.model("User", userSchema);
