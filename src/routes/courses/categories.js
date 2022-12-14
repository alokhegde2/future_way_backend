const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("dotenv/config");

const Category = require("../../models/category_model");
const Pricing = require("../../models/pricing_model");
const Subscription = require("../../models/subscription_model");

const verify = require("../../helpers/verify_token");

const {
  categoryCreationValidation,
  pricingValidation,
} = require("../../validation/courses/category_validation");
const logger = require("../../helpers/logger");

//Creating new category

router.post("/new", verify, async (req, res) => {
  //Validating the submitted data
  const { error } = categoryCreationValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, description } = req.body;

  const categoryData = await Category.findOne({ name: name });

  if (categoryData) {
    return { status: "error", message: "Category Already Exists" };
  }

  let category = new Category({
    name: name,
    description: description,
  });

  try {
    savedCategory = await category.save();
    res.status(200).send({ message: "Category Created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

// Getting all categories
router.get("/", verify, async (req, res) => {
  try {
    const data = await Category.find();
    return res.status(200).json({ categories: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
});

//Updating the category

router.put("/:id", verify, async (req, res) => {
  // Id validation
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid Student Id" });
  }
  const { id } = req.params;

  //Validating the submitted data
  const { error } = categoryCreationValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, description } = req.body;

  const categoryData = await Category.findOne({ name: name });

  if (categoryData) {
    return { status: "error", message: "Category Already Exists" };
  }

  var data = {
    name: name,
    description: description,
  };

  try {
    await Category.findByIdAndUpdate(id, data);
    res.status(200).send({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

/**
 * Adding prices for category
 * Price will differ for each college
 */

router.post("/price", verify, async (req, res) => {
  const { categoryId, collegeId, price } = req.body;

  //Validating the submitted data
  const { error } = pricingValidation(req.body);

  if (error) {
    logger.log({
      level: "error",
      message: `Category| Few data missing | Message:${error.details[0].message} `,
    });
    return res.status(400).json({ message: error.details[0].message });
  }

  //Create the pricing data
  const pricing = new Pricing({
    category: categoryId,
    college: collegeId,
    price: price,
  });

  // Running the query
  try {
    await pricing.save();

    return res.status(200).json({
      status: "success",
      message: "Pricing added successfully!",
      price: pricing,
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: `Category| Unable to create pricing | Message:${error} `,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Some error occured", error: error });
  }
});

router.get("/college-price-cateogory/:collegeId", verify, async (req, res) => {
  const collegeId = req.params.collegeId;

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  //Check college id is proper or not
  if (!mongoose.isValidObjectId(req.params.collegeId)) {
    logger.log({
      level: "error",
      message: `Category| Invalid College ID`,
    });
    return res.status(400).json({ message: "Invalid College Id" });
  }

  try {
    var categoryData = await Pricing.find({ college: collegeId })
      .populate({
        path: "category",
        select: ["name", "description", "_id"],
      })
      .limit(limit)
      .skip(startIndex);

    if (categoryData) {
      return res
        .status(200)
        .json({ status: "success", categories: categoryData });
    } else {
      return res.status(200).json({ status: "success", categories: [] });
    }
  } catch (error) {
    logger.log({
      level: "error",
      message: `Category| /college-price-cateogory/ |Invalid College ID`,
    });
  }
});

/**
 * Getting Categoies bought by student
 */
//TODO: Add isDeleted

router.get(
  "/student-subscribed-category/:studentId",
  verify,
  async (req, res) => {
    const { studentId } = req.params;

    //Check student id is proper or not
    if (!mongoose.isValidObjectId(req.params.studentId)) {
      logger.log({
        level: "error",
        message: `Student| Invalid Student ID`,
      });
      return res.status(400).json({ message: "Invalid Student Id" });
    }

    //Getting the categories from the subscription collection
    try {
      const subscriptionData = await Subscription.find({
        student: studentId,
        isPaid: true,
        renewalDate: { $gt: Date.now() },
      }).populate({
        path: "categoryId",
        select: ["category", "_id"],
        populate:{
          path:"category"
        }
      });

      if (!subscriptionData) {
        return res
          .status(400)
          .json({ status: "error", message: "You're not subscribed" });
      }

      return res
        .status(200)
        .json({ status: "success", categories: subscriptionData });
    } catch (error) {}
  }
);


/**
 * Getting Categoies bought by student excluding isPaid Status
 */
router.get(
  "/student-subscribed-category-college/:studentId",
  verify,
  async (req, res) => {
    const { studentId } = req.params;

    //Check student id is proper or not
    if (!mongoose.isValidObjectId(req.params.studentId)) {
      logger.log({
        level: "error",
        message: `Student| Invalid Student ID`,
      });
      return res.status(400).json({ message: "Invalid Student Id" });
    }

    //Getting the categories from the subscription collection
    try {
      const subscriptionData = await Subscription.find({
        student: studentId,
      }).populate({
        path: "categoryId",
        select: ["category", "_id"],
        populate:{
          path:"category"
        }
      });

      if (!subscriptionData) {
        return res
          .status(400)
          .json({ status: "error", message: "You're not subscribed" });
      }

      return res
        .status(200)
        .json({ status: "success", categories: subscriptionData });
    } catch (error) {
      return res
      .status(500)
      .json({ status: "error", message: "Some error occured" });
    }
  }
);

module.exports = router;
