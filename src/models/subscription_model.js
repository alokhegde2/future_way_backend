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
  modeOfPayment: {
    type: String,
    required: false,
    enum: ["Online", "Offline"],
    default: "Online",
  },
  isPartialPayment: {
    type: Boolean,
    required: true,
    default: false,
  },
  pendingFees: {
    type: Number,
    required: false,
    default: 0,
  },
  dateOfPayment: {
    type: Date,
    required: false,
    // default: Date.now(),
  },
  renewalDate: {
    type: Date,
    required: false,
    // default: Date.now(),
  },
  isDeleted: {
    type: Boolean,
    required:true,
    default: false,
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
