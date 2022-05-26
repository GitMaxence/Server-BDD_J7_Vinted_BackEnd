const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

/////////CREATE
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.fields;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(64);

    const userEmailExist = await User.findOne({ email: email });
    const userUserNameExist = await User.findOne({
      account: { username: username },
    });

    if (username > 1 && userUserNameExist) {
      res.status(409).json({ message: " UserName required or already exist" });
    } else if (userEmailExist) {
      res.status(409).json({ message: " Email already exist" });
    } else {
      // Vérifier l'email === m@il
      if (ValidateEmail(email, res) === true) {
        if (password.length >= 6) {
          // Création User
          const newUser = new User({
            email: email,
            account: {
              username: username,
            },
            newsletter: newsletter,
            token: token,
            hash: hash,
            salt: salt,
          });

          // J'importe l'avatar dans le repertoire de user
          let id = newUser._id;
          let pictureToUploadPath = req.files.picture.path;
          const avatarUser = await cloudinary.uploader.upload(
            pictureToUploadPath,
            {
              folder: `api/vinted/user/${id}`,
            }
          );

          newUser.account.avatar = avatarUser.secure_url;
          await newUser.save();

          res.status(200).json({
            message: "Votre compte à bien été créé",
            _id: newUser.id,
            token: token,
            account: {
              username: username,
              avatarURL: avatarUser.secure_url,
            },
          });
        } else {
          res.status(400).json({ message: "Password is not long enough" });
        }
      } else {
        res.status(400).json({ message: "Error email adress" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function ValidateEmail(input, res) {
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (input.match(validRegex)) {
    return true;
  } else {
    return false;
  }
}

/////////READ

/////////UPDATE

/////////DELETE

module.exports = router;
