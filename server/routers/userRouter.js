const router = require("express").Router();
const jwt = require("jsonwebtoken");
const {v4: uuidv4} = require('uuid');
const User = require("../models/userModel");
const auth = require("../middleware/auth");

router.post("/register", auth,async (req, res) => {
    try {
        const {name, email, username, scl} = req.body;

        if (req.scl !== 1) {
            return res.status(401).json({errorMessage: "Unauthorized."});
        }

        // validation
        if (!email || !name || !username || !scl) {
            return res.status(400).json({
                errorMessage: "Please enter all required fields.",
            });
        }

        // make sure no account exists for this username or email
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({
                errorMessage: "An account with this email already exists.",
            });
        }

        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({
                errorMessage: "An account with this username already exists.",
            });
        }

        // Generate One Time ID
        const onetimeid = uuidv4();

        // save the user in the database
        const newUser = new User({
            name,
            email,
            username,
            scl,
            onetimeid,
        });

        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        console.error(err)
        res.status(500).json({errorMessage: "Error registering user"});
    }
});

router.post("/login", async (req, res) => {
    try {
        const {username, onetimeid, publicKey} = req.body;

        // validation
        if (!username || !onetimeid || !publicKey) {
            return res.status(400).json({
                errorMessage: "Please enter all required fields.",
            });
        }

        // get user account
        const existingUser = await User.findOne({username, onetimeid});
        if (!existingUser) {
            return res.status(401).json({
                errorMessage: "Wrong username or one-time id.",
            });
        }

        // burns the one-time id
        // saves the public key
        existingUser.onetimeid = uuidv4();
        existingUser.publicKey = publicKey;

        await existingUser.save();

        // create a JWT token
        const token = jwt.sign(
            {
                id: existingUser._id,
                scl: existingUser.scl,
            },
            process.env.JWT_SECRET
        );


        const {name} = existingUser;

        res
            .cookie("token", token, {
                httpOnly: true,
                sameSite:
                    process.env.NODE_ENV === "development"
                        ? "lax"
                        : process.env.NODE_ENV === "production" && "none",
                secure:
                    process.env.NODE_ENV === "development"
                        ? false
                        : process.env.NODE_ENV === "production" && true,
            })
            // returns the user content
            .json({
                name, username
            });

    } catch (err) {
        res.status(500).send();
    }
});

module.exports = router;
