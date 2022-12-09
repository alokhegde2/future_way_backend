const mongoose = require("mongoose");

//User Schema
const studentDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 5,
    max: 50,
  },
  phoneNumber: {
    type: String,
    required: true,
    min: 10,
    max: 14,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: true,
  },
  otp: {
    type: Number,
    required: false,
    default: 000000,
  },
  isDisabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Colleges",
    required: true,
  },
  studentCode: {
    type: String,
    required: true,
    min: 2,
  },
  deviceId: {
    type: String,
    required: false,
    default: "",
  },
  isVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
studentDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

studentDataSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Students", studentDataSchema);
