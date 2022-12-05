const mongoose = require("mongoose");

//User Schema
const historyDataSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Students",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  watchedOn: {
    type: Date,
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
historyDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

historyDataSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("History", historyDataSchema);
