const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("dotenv/config");

//STUDENT MODEL
const Student = require("../../models/student_model");

// ALL VAIDATIONS
const {
  studentLoginValidation,
} = require("../../validation/students/student_validation");

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
    var studentData = await Student.findOne({ phoneNumber: phoneNumber });

    if (!studentData) {
      return res
        .status(400)
        .json({ status: "error", message: "User Not Found" });
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

module.exports = router;
