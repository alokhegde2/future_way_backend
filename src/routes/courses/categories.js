const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment/moment");

const app = express();

require("dotenv/config");

const Category = require("../../models/category_model");
const Pricing = require("../../models/pricing_model");
const Subscription = require("../../models/subscription_model");

const verify = require("../../helpers/verify_token");

const {
  categoryCreationValidation,
  pricingValidation,
  subscriptionValidation,
  updateSubscriptionValidation,
} = require("../../validation/courses/category_validation");
const logger = require("../../helpers/logger");

//Creating new category

app.post("/new", verify, async (req, res) => {
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
app.get("/", verify, async (req, res) => {
  try {
    const data = await Category.find();
    return res.status(200).json({ categories: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
});

//Updating the category

app.put("/:id", verify, async (req, res) => {
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

app.post("/price", verify, async (req, res) => {
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

app.get("/college-price-cateogory/:collegeId", verify, async (req, res) => {
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

app.get(
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
        populate: {
          path: "category",
        },
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
app.get(
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
        populate: {
          path: "category",
        },
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

app.delete(
  "/delete-subscription/:subscriptionId",
  verify,
  async (req, res) => {
    const { subscriptionId } = req.params;

    //Check student id is proper or not
    if (!mongoose.isValidObjectId(subscriptionId)) {
      logger.log({
        level: "error",
        message: `Student| Invalid Subscription ID`,
      });
      return res.status(400).json({ message: "Invalid Student Id" });
    }

    try {
      await Subscription.findByIdAndUpdate(subscriptionId, { isDeleted: true });

      return res
        .status(200)
        .json({ status: "success", message: "Access Removed" });
    } catch (error) {
      return res
        .status(400)
        .json({ status: "error", message: "Unable to remove the access" });
    }
  }
);

/**
 * Subscribing new course
 */

app.post("/new-category-subscribe", verify, async (req, res) => {
  const {
    categoryId,
    collegeId,
    dateOfPayment,
    isPaid,
    modeOfPayment,
    studentId,
    isPartialPayment,
  } = req.body;

  //Validating the submitted data
  const { error } = subscriptionValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //Verifying all the ids
  if (!mongoose.isValidObjectId(categoryId)) {
    logger.log({
      level: "error",
      message: `categories.js | /new-category-subscribe | POST | Invalid Category ID`,
    });
    return res.status(400).json({ message: "Invalid Category Id" });
  }

  if (!mongoose.isValidObjectId(collegeId)) {
    logger.log({
      level: "error",
      message: `categories.js | /new-category-subscribe | POST | Invalid College ID`,
    });
    return res.status(400).json({ message: "Invalid College Id" });
  }

  if (!mongoose.isValidObjectId(studentId)) {
    logger.log({
      level: "error",
      message: `categories.js | /new-category-subscribe | POST | Invalid Student ID`,
    });
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  var categoryData = await Pricing.findById(categoryId);

  if (categoryData) {
    var pendingFees = 0;
    var totalFees = categoryData["price"];
    if (isPaid) {
      if (isPartialPayment) {
        pendingFees = totalFees / 2;
      }
    } else {
      pendingFees = totalFees;
    }
    var finalTotalAmount = 0;

    finalTotalAmount = finalTotalAmount + pendingFees;

    var nextPaymentDue;

    if (dateOfPayment) {
      //If the payment made by the student is partial then next payment is after 6 months else after 12 months
      if (isPartialPayment) {
        nextPaymentDue = moment(new Date(dateOfPayment))
          .add(6, "months")
          .toISOString();
      } else {
        nextPaymentDue = moment(new Date(dateOfPayment))
          .add(12, "months")
          .toISOString();
      }
    }

    var subscription = new Subscription({
      categoryId: categoryId,
      college: collegeId,
      dateOfPayment: dateOfPayment,
      isPaid: isPaid,
      modeOfPayment: modeOfPayment,
      student: studentId,
      totalFees: categoryData["price"],
      pendingFees: pendingFees,
      isPartialPayment: isPartialPayment,
      renewalDate: nextPaymentDue,
    });

    try {
      await subscription.save();

      return res
        .status(200)
        .json({ status: "success", message: "Subscribed Successfully!" });
    } catch (error) {
      logger.log({
        level: "error",
        message: `categories.js | /new-category-subscribe | POST | Error: ${error}`,
      });
      return res.status(400).json({
        status: "error",
        message: "Unable to subscribe",
        error: error,
      });
    }
  }
});

/**
 * Updating the created ubscription
 * Which is only allowed for the college admin and the system admin
 * So do implement in the app side or the student web app side
 */

app.put("/update/category-subscribed", verify, async (req, res) => {
  const {
    subscriptionId,
    dateOfPayment,
    isPaid,
    modeOfPayment,
    isPartialPayment,
  } = req.body;

  //Validating the submitted data
  const { error } = updateSubscriptionValidation(req.body);
  if (error) {
    logger.log({
      level: "error",
      message: `categories.js | /update-category-subscribed | PUT | ${error.details[0].message}`,
    });
    return res.status(400).json({ message: error.details[0].message });
  }

  //Verifying all the ids
  if (!mongoose.isValidObjectId(subscriptionId)) {
    logger.log({
      level: "error",
      message: `categories.js | /update-category-subscribed | PUT | Invalid Subscription Id`,
    });
    return res.status(400).json({ message: "Invalid Subscription Id" });
  }

  var subscriptionDataStatus = await Subscription.findById(subscriptionId);

  var categoryData = await Pricing.findById(subscriptionDataStatus.categoryId);

  if (subscriptionDataStatus && categoryData) {
    var pendingFees = 0;
    var totalFees = categoryData.price;
    var nextPaymentDue;

    var updatedSubscriptionData = {};

    if (modeOfPayment === "Offline") {
      if (!subscriptionDataStatus.isPaid && isPaid) {
        if (isPartialPayment) {
          pendingFees = totalFees / 2;
          updatedSubscriptionData["isPartialPayment"] = isPartialPayment;
        }

        if (dateOfPayment) {
          //If the payment made by the student is partial then next payment is after 6 months else after 12 months
          if (isPartialPayment) {
            nextPaymentDue = moment(new Date(dateOfPayment))
              .add(6, "months")
              .toISOString();
          } else {
            nextPaymentDue = moment(new Date(dateOfPayment))
              .add(12, "months")
              .toISOString();
          }

          updatedSubscriptionData["renewalDate"] = nextPaymentDue;
          updatedSubscriptionData["dateOfPayment"] = dateOfPayment;
        }
      } else {
        pendingFees = subscriptionDataStatus.pendingFees;
      }
    }

    var finalTotalAmount = subscriptionDataStatus.totalFees;

    updatedSubscriptionData["pendingFees"] = pendingFees;
    updatedSubscriptionData["totalFees"] = finalTotalAmount;

    try {
      await Subscription.findByIdAndUpdate(
        subscriptionId,
        updatedSubscriptionData
      );

      return res
        .status(200)
        .json({ status: "success", message: "Update successfull!" });
    } catch (error) {
      logger.log({
        level: "error",
        message: `categories.js | /update-category-subscribed | PUT | Error: ${error}`,
      });

      return res.status(400).json({
        status: "error",
        message: "Unable to update subscribtion",
        error: error,
      });
    }
  } else {
    return res
      .status(200)
      .json({ status: "success", message: "Nothing to subscribe" });
  }
});

module.exports = app;
