const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("dotenv/config");

const verify = require("../../helpers/verify_token");

const Category = require("../../models/category_model");
const Course = require("../../models/course_model");

// GET COURSES ON THE CATEGORY ID

router.get("/categoryCourse", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.categoryId)) {
    return res.status(400).json({ message: "Invalid Category Id" });
  }

  const { categoryId } = req.query;

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  try {
    const data = await Course.find({ category: categoryId })
      .populate({
        path: "category",
        select: ["name", "description"],
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Some unknown error occured" });
  }
});

module.exports = router;
