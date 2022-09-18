const mongoose = require("mongoose");

//User Schema
const collegeDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  code: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
collegeDataSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

collegeDataSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Colleges", collegeDataSchema);
