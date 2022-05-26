const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: { type: String, maxlength: 50 },
  product_description: String,
  product_price: { type: Number, max: 100000 },
  product_details: { type: Array, maxlength: 500 },
  product_image: { type: mongoose.Schema.Types.Mixed, default: {} },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
