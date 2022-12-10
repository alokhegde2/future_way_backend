const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv/config");

//STUDENT MODEL
const Student = require("../../models/student_model");

const verify = require("../../helpers/verify_token");

// ALL VAIDATIONS
const {
  studentLoginValidation,
  studentLoginWebValidation,
  generateOtpValidation,
} = require("../../validation/students/student_validation");
const logger = require("../../helpers/logger");
const sendMail = require("../../helpers/mail");

//LOGIN ROUTE

router.post("/login", async (req, res) => {
  //VALIDATING THE DATA BEFORE LOGGING DATA

  const { error } = studentLoginValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // GETTING DATA FROM BODY
  const { phoneNumber } = req.body;

  // VERIFY IF THE MOBILE NUMBER IS PROPER OR NOT

  try {
    var studentData = await Student.findOne({
      phoneNumber: phoneNumber,
      isDeleted: false,
    });

    if (!studentData) {
      return res
        .status(400)
        .json({ status: "error", message: "User Not Found" });
    }

    // CHECKING FOR STUDENT PAID MONEY OR NOT
    if (studentData["isVerified"] == false) {
      logger.log({
        level: "error",
        message: "Login Student | /login | Error: Mail ID id not verified. ",
      });
      return res.status(400).json({
        status: "error",
        message:
          "You're mail id is not verified please find the mail and verify your id",
      });
    }

    //  CHECK IF THE ACCOUNT IS DISABLED
    if (studentData["isDisabled"] === true) {
      logger.log({
        level: "error",
        message:
          "Login Student | /login | Error:Your account is disabled, Please contact our team. ",
      });
      return res.status(400).json({
        status: "error",
        message: "Your account is disabled, Please contact our team.",
      });
    }

    //Adding the device id to the db
    if (req.body.loginFrom === "app") {
      await Student.findByIdAndUpdate(studentData["id"], {
        deviceId: req.body.deviceId,
      });
    }

    //importing secret password
    const secret = process.env.SECRET;

    //Creating jwt
    const token = jwt.sign(
      {
        id: studentData.id,
        email: studentData.email,
      },
      secret,
      { expiresIn: "7d" }
    );

    //returning succes with header auth-token
    return res
      .status(200)
      .header("auth-token", token)
      .json({ status: "success", authToken: token });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

/**
 * Login through email for web (Verify otp and login)
 */

router.post("/web-login", async (req, res) => {
  //VALIDATING THE DATA BEFORE LOGGING DATA

  const { error } = studentLoginWebValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // GETTING DATA FROM BODY
  const { email, otp } = req.body;

  // VERIFY IF THE MOBILE NUMBER IS PROPER OR NOT

  try {
    var studentData = await Student.findOne({
      email: email,
      isDeleted: false,
    });

    if (!studentData) {
      return res
        .status(400)
        .json({ status: "error", message: "User Not Found" });
    }

    // CHECKING FOR STUDENT PAID MONEY OR NOT
    if (studentData["isVerified"] == false) {
      logger.log({
        level: "error",
        message:
          "Login Student | /web-login | Error: Mail ID id not verified. ",
      });
      return res.status(400).json({
        status: "error",
        message:
          "You're mail id is not verified please find the mail and verify your id",
      });
    }

    //  CHECK IF THE ACCOUNT IS DISABLED
    if (studentData["isDisabled"] === true) {
      logger.log({
        level: "error",
        message:
          "Login Student | /web-login | Error:Your account is disabled, Please contact our team. ",
      });
      return res.status(400).json({
        status: "error",
        message: "Your account is disabled, Please contact our team.",
      });
    }

    //Verifing the otp
    var generatedOtp = studentData["otp"];

    if (generatedOtp !== parseInt(otp)) {
      logger.log({
        level: "error",
        message: "student.js | /web-login | Otp is not matching",
      });

      return res.status(400).json({ status: "error", message: "Wrong OTP" });
    }
    //importing secret password
    const secret = process.env.SECRET;

    //Creating jwt
    const token = jwt.sign(
      {
        id: studentData.id,
        email: studentData.email,
      },
      secret,
      { expiresIn: "7d" }
    );

    //returning succes with header auth-token
    return res
      .status(200)
      .header("auth-token", token)
      .json({ status: "success", authToken: token });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

/**
 * Genrating otp
 */

router.post("/generate-otp", async (req, res) => {
  //VALIDATING THE DATA BEFORE Generating

  const { error } = generateOtpValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email } = req.body;

  try {
    var statusResponse = await Student.findOne({
      email: email,
      isDeleted: false,
    });

    if (!statusResponse) {
      logger.log({
        level: "error",
        message: `student.js | /generate-otp | Student not found with email id ${email}`,
      });

      return res
        .status(400)
        .json({ status: "error", message: "Account not found!" });
    }

    var isVerified = statusResponse.isVerified;

    if (!isVerified) {
      logger.log({
        level: "error",
        message: `student.js | /generate-otp | Student email id is not verified | Email : ${email}`,
      });

      return res
        .status(400)
        .json({ status: "error", message: "Account is not verified" });
    }

    // Create the otp
    var otp = Math.floor(100000 + Math.random() * 900000);

    // Save the otp to db
    await Student.findByIdAndUpdate(statusResponse.id, { otp: otp });

    // IF success trigger mail with otp
    await sendMail(email, otp, "#", "otp", "OTP for future way web app login");

    // Then send the success respone
    return res
      .status(200)
      .json({ status: "success", message: "OTP Triggerd Successfully!" });
  } catch (error) {
    logger.log({
      level: "error",
      message: `student.js | /generate-otp | Interner Server Error | Error : ${error}`,
    });
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

/**
 * Verifying the device id of the current active user
 */

router.post("/verify-device", verify, async (req, res) => {
  const { deviceId, studentId } = req.body;

  if (!deviceId || !studentId) {
    logger.log({
      level: "error",
      message: `Student.js | /verify-device | {"status":"error","message":"deviceId and studentId are required"}`,
    });
    return res.status(400).json({
      status: "error",
      message: "deviceId and studentId are required",
    });
  }

  // Checking if the student id is the object id
  if (!mongoose.isValidObjectId(studentId)) {
    logger.log({
      level: "error",
      message: `Student.js | /verify-device | {status:"error", message: "Invalid Student Id" }`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Invalid Student Id" });
  }

  var studentData = await Student.findById(studentId);

  if (!studentData) {
    logger.log({
      level: "error",
      message: `Student.js | /verify-device | {"status":"error","message":"Unable to find the student"}`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Unable to find the student" });
  }

  if (studentData.deviceId !== deviceId) {
    logger.log({
      level: "error",
      message: `Student.js | /verify-device | {"status":"error","message":"Device Id not matching"}`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Device id is not proper" });
  }

  return res
    .status(200)
    .json({ status: "success", message: "Device id is proper" });
});

/**
 * Getting single student data
 */
router.get("/:id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  const { id } = req.params;

  try {
    const data = await Student.findById(id).populate("college");
    return res.status(200).json({ student: data });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error });
  }
});

module.exports = router;
