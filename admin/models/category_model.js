const mongoose = require("mongoose");

//User Schema
const categoryDataSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      min: 3,
      max: 255,
    },
    description: {
        type: String,
        default:"",
        min: 3,
        max: 255,
      },
    createdDate: {
      type: Date,
      default: Date.now(),
    },
  });
  
  //Creating virtual id
  categoryDataSchema.virtual("id").get(function(){
    return this._id.toHexString();
  });
  
  categoryDataSchema.set("toJSON", {
    virtuals: true,
  });
  
  //Exporting modules
  module.exports = mongoose.model("Categories", categoryDataSchema);