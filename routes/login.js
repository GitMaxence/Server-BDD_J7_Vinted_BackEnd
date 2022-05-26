const express = require("express");
const router = express.Router();

const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

/////////CREATE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const userEmailExist = await User.findOne({ email: email });
    console.log(userEmailExist);

    if (userEmailExist.email) {
      if (password.length > 0) {
        const newHash = SHA256(password + userEmailExist.salt).toString(
          encBase64
        );
        const userHash = userEmailExist.hash;

        if (userHash === newHash) {
          res.status(200).json({ message: "User successfully login" });
        } else {
          res.status(400).json({ message: "Password's wrong" });
        }
      } else {
        res.status(400).json({ message: "Please enter password" });
      }
    } else {
      res.status(400).json({ message: "User don't exist" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/////////READ

/////////UPDATE

/////////DELETE

module.exports = router;
