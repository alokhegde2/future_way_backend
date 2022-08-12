const mongoose = require("mongoose");

//User Schema
const courseDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255,
    },
    description: {
        type: String,
        required: true,
        min: 5,
    },
    thumbnailUrl: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
});

//Creating virtual id
courseDataSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

courseDataSchema.set("toJSON", {
    virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Courses", courseDataSchema);