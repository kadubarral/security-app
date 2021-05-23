const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true},
        username: {type: String, required: true},
        scl: {type: Number, required: true, ref: 'seclevel'},
        onetimeid: {type: String, required: true},
        publicKey: {type: String, required: false},
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
