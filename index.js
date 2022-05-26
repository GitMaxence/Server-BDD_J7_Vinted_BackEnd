const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.COUDINARY_API,
  api_secret: process.env.COUDINARY_API_SECRET,
  secure: true,
});

//LogIn & SignUp
const signUpRoutes = require("./routes/signup");
app.use(signUpRoutes);

const logInRoutes = require("./routes/login");
app.use(logInRoutes);

// Products
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

//// All
app.all("*", (req, res) => {
  res.status(404).json("Route introuvable");
});

app.listen(process.env.PORT, () => {
  console.log("Serveur started");
});
