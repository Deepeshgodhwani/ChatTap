const express = require("express");
const router = express.Router();
const fetchUser = require("../config/fetchUser");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// creating user signing up  //
router.post(
  "/createUser",
  [
    body("name", "Please enter name").notEmpty(),
    // check whether emails format is correct or not //
    body("email", "Please enter valid email").isEmail(),
    // password must be at least 5 chars long
    body("password", "Please enter valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      // if there errors,return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // console.log(req);
        return res.status(400).json({ error: errors.array() });
      }

      // check whether the user  with email exists already

      let userr = await User.findOne({ email: req.body.email });
      if (userr) {
        return res.send({ error: [{ msg: "User is already exist" }] });
      }

      // to encrypt password before saving //

      const salt = await bcrypt.genSaltSync(10);
      const encryptedpass = await bcrypt.hash(req.body.password, salt);

      let user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: encryptedpass,
      });

      const data = {
        userId: user._id,
      };

      const authToken = jwt.sign(data, jwtSecret);
      return res.send({ error: false, authToken });
    } catch (err) {
      console.error(err.message);
      res.status(200).send("Internal Server Error");
    }
  }
);

// logging up user //
router.post(
  "/login",
  [
    // check whether emails format is correct or not //
    body("email", "please enter valid email").isEmail(),
    // password must be at least 5 chars long
    body("password", "please enter valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const { email, password } = req.body;
    try {
      // finding user exist or not //
      let user = await User.findOne({ email });

      if (!user) {
        // sending error if user does not exist//
        return res.send({
          error: true,
          message: "Please enter valid login credentials",
        });
      } else {
        // checking the encrypted password whether its matched with the saved one or not //
        let check = await bcrypt.compare(password, user.password);
        if (!check) {
          return res.send({
            error: true,
            message: "Please enter valid login credentials",
          });
        }

        const data = {
          userId: user._id,
        };

        //sending jwt token if password ans email password is verified //
        const authToken = jwt.sign(data, jwtSecret);
        return res.send({ authToken });
      }
    } catch (err) {
      console.error(err.message);
      res.status(200).send("Internal Server Error");
    }
  }
);

//fetching log user details //

router.get("/getUser", fetchUser, async (req, res) => {
  try {
    console.log(req.user);
    let userId = req.user;
    let user = await User.findById(userId).select("-password");
    if (user) {
      return res.send(user);
    }

    return res.send("Please enter valid login credentials");
  } catch (error) {
    console.error(error.message);
    res.status(200).send("Internal Server Error");
  }
});

module.exports = router;
