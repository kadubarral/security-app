const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.post("/register", auth, async (req, res) => {
  try {
    const { name, email, username, scl } = req.body;

    console.log(req.user);
    console.log(req.scl);

    if (req.scl !== 1)
      return res.status(401).json({ errorMessage: "Unauthorized." });

    // validation

    if (!email || !name || !username || !scl)
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });

    // make sure no account exists for this username or email

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({
        errorMessage: "An account with this email already exists.",
      });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({
        errorMessage: "An account with this username already exists.",
      });

    // Generate One Time ID

    var onetimeid = Math.random().toString(36).slice(-12);

    // hash the password

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(onetimeid, salt);

    // save the user in the database

    const newUser = new User({
      name,
      email,
      username,
      scl,
      onetimeid,
      passwordHash,
    });

    const savedUser = await newUser.save();

    res.json(savedUser);
  } catch (err) {
    console.log(err)
    res.status(500).send();
  }
});

router.put("/:username", async (req, res) => {
  try {
    const { onetimeid, password, passwordVerify } = req.body;
    const username = req.params.username;

    // validation

    if (!username || !onetimeid || !password || !passwordVerify)
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });

    if (password.length < 8)
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });

    if (password !== passwordVerify)
      return res.status(400).json({
        errorMessage: "Please enter the same password twice for verification.",
      });

    // hash the password

    const salt = await bcrypt.genSalt();
    const newpasswordHash = await bcrypt.hash(password, salt);

    // make sure account exists

    const originalUser = await User.findOne({ username });
    if (!originalUser)
      return res.status(400).json({
        errorMessage: "No account with this username",
      });

    if (onetimeid !== originalUser.onetimeid)
      return res.status(400).json({
        errorMessage: "No account with this username",
      });

    var newonetimeid = Math.random().toString(36).slice(-12);

    originalUser.passwordHash = newpasswordHash;
    originalUser.onetimeid = newonetimeid;

    const savedUser = await originalUser.save();

    // create a JWT token

    const token = jwt.sign(
      {
        id: savedUser._id,
        scl: savedUser.scl,
      },
      process.env.JWT_SECRET
    );

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
      .send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation

    if (!email || !password)
      return res.status(400).json({
        errorMessage: "Please enter all required fields.",
      });

    // get user account

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(401).json({
        errorMessage: "Wrong email or password.",
      });

    const correctPassword = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!correctPassword)
      return res.status(401).json({
        errorMessage: "Wrong email or password.",
      });

    // create a JWT token

    const token = jwt.sign(
      {
        id: existingUser._id,
        scl: existingUser.scl,
      },
      process.env.JWT_SECRET
    );

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
      .send();
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json(null);

    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);

    res.json(validatedUser.id);
  } catch (err) {
    return res.json(null);
  }
});

router.get("/logOut", (req, res) => {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        sameSite:
          process.env.NODE_ENV === "development"
            ? "lax"
            : process.env.NODE_ENV === "production" && "none",
        secure:
          process.env.NODE_ENV === "development"
            ? false
            : process.env.NODE_ENV === "production" && true,
        expires: new Date(0),
      })
      .send();
  } catch (err) {
    return res.json(null);
  }
});

module.exports = router;
