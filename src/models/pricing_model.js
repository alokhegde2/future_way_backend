const mongoose = require("mongoose");

//User Schema
const pricingDataSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: true,
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Colleges",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  modifiedDate: {
    type: Date,
    default: Date.now(),
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
pricingDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

pricingDataSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Pricing", pricingDataSchema);
