const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");

const Offer = require("../models/Offer");
const User = require("../models/User");

/////////CREATE
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // Champs de données
    const { title, description, price, brand, size, condition, color, city } =
      req.fields;
    const fileKeys = Object.keys(req.files);

    // Création de l'annonce
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    // J'upload une ou plusieurs images sur cloudinary
    let idOffer = newOffer._id; //En récupérant un iD de l'annonce pour l'arboréssance

    let results = {};

    if (fileKeys.length === 0) {
      res.send("No file uploaded!");
    }
    fileKeys.forEach(async (fileKey) => {
      try {
        const file = req.files[fileKey];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `api/vinted/offers/${idOffer}`,
        });
        results[fileKey] = {
          success: true,
          result: result.secure_url,
        };
        if (Object.keys(results).length === fileKeys.length) {
          newOffer.product_image = results;
          await newOffer.save();
          res.status(200).json({
            message: "Offre publiée !",
            _id: newOffer.id,
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
              { MARQUE: brand },
              { TAILLE: size },
              { ÉTAT: condition },
              { COULEUR: color },
              { EMPLACEMENT: city },
            ],
            product_image: results,
            owner: req.userToken._id,
          });
        }
      } catch (error) {
        return res.json({ error: error.message });
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/////////READ

router.get("/offers", async (req, res) => {
  try {
    let { offers, page, title, priceMax, priceMin, sort } = req.query;

    // const offersTitle = await Offer.find({
    //   product_name: new RegExp(title, "i"),
    // }).select("product_name product_price");

    // const offersMinMaxPrice = await Offer.find({
    //   product_price: { $gte: Number(priceMin), $lte: Number(priceMax) },
    // }).select("product_name product_price");

    // const offersAscDescPrice = await Offer.find()
    //   .sort({ product_price: sort.replace("price-", "") })
    //   .select("product_name product_price");

    ///////// One shot

    //Offer per page
    if (!offers) {
      offers = 3;
    }

    if (!page || page <= 0) {
      page = 1;
    }

    let skipPage = offers * (page - 1);

    //Ordre
    if (sort === `price-desc`) {
      sort = { product_price: "desc" };
    } else if (sort === `price-asc`) {
      sort = { product_price: "asc" };
    } else {
      sort = {};
    }

    // Prix
    if (!priceMin) {
      priceMin = 0;
    }
    if (!priceMax) {
      priceMax = 100000;
    }

    const offersFilter = await Offer.find({
      product_name: new RegExp(title, "i"),
      product_price: {
        $gte: priceMin,
        $lte: priceMax,
      },
    })
      .sort(sort)
      .skip(skipPage) // Nb de résultat ignoré => Util pour le nombre de résultat par page
      .limit(offers) // Nb de résultat renvoyé/affiché
      .select("product_name product_price");

    res.status(200).json({ count: offersFilter.length, offersFilter });

    ///////// Cours

    // const result = await Offer.find({
    //   product_condition: new RegExp("title", "i"),
    // }).select("product_name product_price");

    // const result = await Offer.find({
    //   product_price: { $gte: 50, $lte: 100 },
    // }).select("product_name product_price");

    // const result = await Offer.find()
    //   .sort({ product_price: asc }) // asc/1 ou desc/-1
    //   .select("product_name product_price");

    // const result = await Offer.find()
    //   .skip(0) // Nb de résultat ignoré => Util pour le nombre de résultat par page
    //   .limit(3) // Nb de résultat renvoyé/affiché
    //   .select("product_name product_price");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("owner", "account")
      .select("product_image.secure_url");

    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/////////UPDATE

router.put("/offer/modify", isAuthenticated, async (req, res) => {
  try {
    // Champs de données
    const {
      id,
      title,
      description,
      price,
      brand,
      size,
      condition,
      color,
      city,
      //Plusieurs images
    } = req.fields;

    const offerToModify = await Offer.findById(id);

    if (title) {
      offerToModify.product_name = title;
    }
    if (description) {
      offerToModify.product_details = description;
    }
    if (price) {
      offerToModify.product_price = price;
    }
    if (brand) {
      offerToModify.product_details[0].MARQUE = brand;
    }
    if (size) {
      offerToModify.product_details[1].TAILLE = size;
    }
    if (condition) {
      offerToModify.product_details[2].ÉTAT = condition;
    }
    if (color) {
      offerToModify.product_details[3].COULEUR = color;
    }
    if (city) {
      offerToModify.product_details[4].EMPLACEMENT = city;
    }

    // Pour supp des obj nesté
    await offerToModify.markModified("product_details");

    //
    if (newPicture) {
      // On supprime ce qu'il y a dans le dossier
      await cloudinary.api.delete_resources_by_prefix(
        `api/vinted/offers/${id}`
      );

      const pictureToModify = await cloudinary.uploader.upload(file.path, {
        folder: `api/vinted/offers/${id}`,
      });

      // J'upload une ou plusieurs images sur cloudinary
      let idOffer = id; //En récupérant un iD de l'annonce pour l'arboréssance

      const fileKeys = Object.keys(req.files);
      let results = {};

      if (fileKeys.length === 0) {
        res.send("No file uploaded!");
      }
      fileKeys.forEach(async (fileKey) => {
        try {
          const file = req.files[fileKey];
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `api/vinted/offers/${idOffer}`,
          });
          results[fileKey] = {
            success: true,
            result: result.secure_url,
          };
          if (Object.keys(results).length === fileKeys.length) {
            newOffer.product_image = results;
            await newOffer.save();
            res.status(200).json({
              message: "Offre publiée !",
              _id: newOffer.id,
              product_name: title,
              product_description: description,
              product_price: price,
              product_details: [
                { MARQUE: brand },
                { TAILLE: size },
                { ÉTAT: condition },
                { COULEUR: color },
                { EMPLACEMENT: city },
              ],
              product_image: results,
              owner: req.userToken._id,
            });
          }
        } catch (error) {
          return res.json({ error: error.message });
        }
      });
    }
    await offerToModify.save();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/////////DELETE

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    // Champs de données
    const { id } = req.fields;

    const userOfferExist = await Offer.findById(id);

    if (userOfferExist) {
      // On supprime ce qu'il y a dans le dossier
      await cloudinary.api.delete_resources_by_prefix(
        `api/vinted/offers/${id}`
      );
      // Une fois le dossier vide, on peut le supprimer !
      await cloudinary.api.delete_folder(`api/vinted/offers/${id}`);
      // Suppr de la BDD
      await userOfferExist.deleteOne();

      res.status(200).json({
        message: "Offre supprimée !",
      });
    } else {
      res.status(401).json({ message: "L'offre n'existe pas" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
