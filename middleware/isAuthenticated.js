const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");

  if (req.headers.authorization) {
    const user = await User.findOne({ token: token }).select("account _id"); //.select() => Choisir les clefs a afficher

    if (user) {
      //   J'ai fait une requête à ma BDD et j'ai des infos concernant le user que j'ai trouvé, je stocke ces informations dans req, comme ça je pourrai y avoir accès dans le reste de ma route
      req.userToken = user;
      // Je passe à la suite de ma route
      next();
    } else {
      //   Si je trouve pas mon user, je renvoie une erreur
      res.status(401).json({ message: "Unauthorized 2" });
    }
  } else {
    //   Si je trouve pas mon user, je renvoie une erreur
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
