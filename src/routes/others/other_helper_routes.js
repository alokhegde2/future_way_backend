const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

require("dotenv/config");

const College = require("../../models/college_data_model");

const Student = require("../../models/student_model");

const verify = require("../../helpers/verify_token");

// COMPRESSING/TRUNCATING THE USERS/STUDENT DATABASE

router.delete("/student", verify, async (req, res) => {
  try {
    await Student.deleteMany({});

    return res.status(200).json({
      status: "Success",
      message: "Student db truncated successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Some error occured", error: error });
  }
});

module.exports = router;
