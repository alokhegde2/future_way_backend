const mongoose = require("mongoose");

//User Schema
const subscriptionDataSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Students",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pricing",
    required: true,
    unique: true,
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Colleges",
    required: true,
  },
  totalFees: {
    type: Number,
    required: false,
    default: 0,
  },
  isPaid: {
    type: Boolean,
    required: false,
    default: false,
  },
  isPartialPayment: {
    type: Boolean,
    required: true,
  },
  pendingFees: {
    type: Number,
    required: false,
    default: 0,
  },
  dateOfPayment: {
    type: Date,
    required: false,
    default: Date.now(),
  },
  renewalDate: {
    type: Date,
    required: false,
    default: Date.now(),
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
subscriptionDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subscriptionDataSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Subscriptions", subscriptionDataSchema);
