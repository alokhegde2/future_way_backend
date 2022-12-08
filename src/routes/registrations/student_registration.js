const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const moment = require("moment/moment");
const jwt = require("jsonwebtoken");
const path = require("path");

require("dotenv/config");

const College = require("../../models/college_data_model");
const Student = require("../../models/student_model");
const Subscriptions = require("../../models/subscription_model");
const Pricing = require("../../models/pricing_model");

const verify = require("../../helpers/verify_token");
const logger = require("../../helpers/logger");

const {
  studentRegisterValidation,
  studentUpdateValidation,
} = require("../../validation/registration/student_registration_validation");
const sendMail = require("../../helpers/mail");

//Initializing app
const app = express();

/**
 * Registering new student
 */

app.post("/register", verify, async (req, res) => {
  const { error } = studentRegisterValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const {
    name,
    email,
    phoneNumber,
    isPaid,
    modeOfPayment,
    collegeId,
    categorySubscribedId,
    isPartialPayment,
    dateOfPayment,
  } = req.body;

  const collegeData = await College.findById(collegeId);

  if (!collegeData) {
    console.error("College Data Not Found (Data Comes Next) :", collegeData);
    return res.status(400).json({ message: "College Not Found!" });
  }

  const collegeCode = collegeData["code"];

  //Counting the students from that collge

  const studentData = await Student.find({ collegeId: collegeId });

  const studentCount = studentData.length;

  var currentStudentCountNumber;

  if (studentCount + 1 < 10) {
    currentStudentCountNumber = "0" + (studentCount + 1).toString();
  } else {
    currentStudentCountNumber = (studentCount + 1).toString();
  }

  var studentCode = collegeCode + "-" + currentStudentCountNumber;

  //Check if student mail id present or not

  const studentMailIdStatus = await Student.find({ email: email });

  if (studentMailIdStatus.length != 0) {
    return res.status(400).json({ message: "Given Mail Id Already Used!" });
  }

  const studentRegistration = new Student({
    name: name,
    email: email,
    college: collegeId,
    isPaid: isPaid,
    phoneNumber: phoneNumber,
    studentCode: studentCode,
    dateOfPayment: dateOfPayment,
  });

  //Saving all data
  try {
    savedstudent = await studentRegistration.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }

  var nextPaymentDue;
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

  var finalTotalAmount = 0;

  ///Creating subscription
  for (let index = 0; index < categorySubscribedId.length; index++) {
    var categoryData = await Pricing.findById(categorySubscribedId[index]);
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

      finalTotalAmount = finalTotalAmount + pendingFees;

      var subscription = new Subscriptions({
        categoryId: categorySubscribedId[index],
        college: collegeId,
        dateOfPayment: dateOfPayment,
        isPaid: isPaid,
        modeOfPayment:modeOfPayment,
        student: studentRegistration.id,
        totalFees: categoryData["price"],
        pendingFees: pendingFees,
        isPartialPayment: isPartialPayment,
        renewalDate: nextPaymentDue,
      });

      logger.log({
        level: "info",
        message: `categoryId: ${categorySubscribedId[index]},
        college: ${collegeId},
        dateOfPayment: ${dateOfPayment},
        paidFees: ${isPaid},
        student: ${studentRegistration.id},
        totalFees: ${categoryData["price"]},
        pendingFees:${pendingFees},
        isPartialPayment: ${isPartialPayment},
        renewalDate: ${nextPaymentDue},`,
      });
    } else {
      logger.log({
        level: "info",
        message: `Category not found in price collection| Category ID ${categorySubscribedId[index]}`,
      });
    }

    //Creating the subscription
    await subscription.save();
  }

  //Creating the verification link

  //importing secret password
  const secret = process.env.SECRET;

  //Creating jwt
  const token = jwt.sign(
    {
      id: studentRegistration.id,
    },
    secret,
    { expiresIn: "7d" }
  );

  var verificationLink = `https://${req.hostname}:3000${req.baseUrl}/verify/${token}`;

  await sendMail(
    email,
    name,
    verificationLink,
    "account-created",
    "Hurray!!! Your Account Created Successfully 🎉"
  );

  logger.log({
    level: "info",
    message: `Account created successfully for ${name} ${email}`,
  });

  return res.status(200).json({
    message: "Student Account Created Successfuly",
    totalOrderAmount: finalTotalAmount,
    isPaid: isPaid,
  });
});

/**
 * Verifing student
 */

app.get("/verify/:token", async (req, res) => {
  const token = req.params.token;

  //Verifying token
  try {
    //verifing token
    const verified = jwt.verify(token, process.env.SECRET);
    req.user = verified;

    var decodedToken = jwt.decode(token);
    var id = decodedToken["id"];

    var updateStatus = await Student.findByIdAndUpdate(id, {
      isVerified: true,
    });

    return res.sendFile(
      path.join(__dirname, "../../../", "/public/templates/verified.html")
    );
  } catch (error) {
    return res.sendFile(
      path.join(__dirname, "../../../", "/public/templates/error.html")
    );
  }
});

/** */

/**
 * Forgot Password
 */

app.post("/forgort-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: "error", message: "Email is required" });
  }

  try {
    var userStatus = await Student.findOne({ email: email });

    if (!userStatus) {
      return res
        .status(400)
        .json({ status: "error", message: "Account not found!" });
    }

    //Creating the password reset link

    //importing secret password
    const secret = process.env.SECRET;

    //Creating jwt
    const token = jwt.sign(
      {
        id: userStatus.id,
        email: userStatus.email,
      },
      secret,
      { expiresIn: "7d" }
    );

    //Verification link
    var verificationLink = `https://${req.hostname}:3000${req.baseUrl}/reset-password/${token}`;

    await sendMail(
      email,
      "",
      verificationLink,
      "forgot-password",
      "Reset Password 🔑"
    );
  } catch (error) {
    logger.log({
      level: "error",
      message: `Forgot Password | Email: ${email} | Error: ${error}`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Some error occured", error: error });
  }
});

/**
 * Getting all the students
 */

app.get("/allStudents", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  try {
    const data = await Student.find({ isDisabled: false })
      .populate({
        path: "categorySubscribed",
        select: ["name", "description"],
      })
      .populate({
        path: "college",
        select: ["name", "code"],
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({ students: data });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error });
  }
});

/**
 * Getting THE STUDENT DATA
 */

app.get("/:id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  const { id } = req.params;

  try {
    const data = await Student.findById(id);
    return res.status(200).json({ student: data });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error });
  }
});

/**
 * Updating Student data
 */

app.put("/:id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  // VERIFYING THE DATA WHICH ARE SENT FROM THE BODY
  const { error } = studentUpdateValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // GETTING TALL THE DATA

  const { name, email, phoneNumber, isPaid, collegeId } = req.body;

  //VERIFYING THE COLLEGE ID

  const collegeData = await College.findById(collegeId);

  // IF COLLEGE ID IS WRONG

  if (!collegeData) {
    console.error("College Data Not Found (Data Comes Next) :", collegeData);
    return res.status(400).json({ message: "College Not Found!" });
  }

  //Check if student mail id present or not

  const studentMailIdStatus = await Student.find({
    email: email,
    _id: { $ne: req.params.id },
  });

  if (studentMailIdStatus.length != 0) {
    return res.status(400).json({ message: "Given Mail Id Already Used!" });
  }

  const data = {
    name: name,
    email: email,
    college: collegeId,
    isPaid: isPaid,
    phoneNumber: phoneNumber,
  };

  //UPDATING THE DATA
  try {
    var savedstudent = await Student.findByIdAndUpdate(req.params.id, data);

    return res.status(200).json({ message: "Student Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

/**
 * DELETING THE STUDENT CREATED
 */

app.delete("/:id", verify, async (req, res) => {
  // VERIFYING THE ID
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid Course Id" });
  }

  try {
    var response = await Student.findByIdAndUpdate(req.params.id, {
      isDisabled: true,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Student Disbaled Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Some unknown error occured",
      error: error,
    });
  }
});

/**
 * GETTING STUDENTS ON THE BASIS OF THE COLLEGE
 */

app.get("/college/:collegeId", verify, async (req, res) => {
  // VERIFYING THE ID
  if (!mongoose.isValidObjectId(req.params.collegeId)) {
    return res.status(400).json({ message: "Invalid College Id" });
  }

  var collegeId = req.params.collegeId;

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  try {
    var studentData = await Student.find({
      college: collegeId,
      isDisabled: false,
    })
      .populate({
        path: "categorySubscribed",
        select: ["name", "description"],
      })
      .populate({
        path: "college",
        select: ["name", "code"],
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({ students: studentData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Some unknown error occured",
      error: error,
    });
  }
});

module.exports = app;
