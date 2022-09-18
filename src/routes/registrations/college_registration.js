const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

require("dotenv/config");

const College = require("../../models/college_data_model");

const verify = require("../../helpers/verify_token");

const {
  collegeRegisterValidation,
  collegeUpdationValidation,
} = require("../../validation/registration/college_registration_validation");

//Registering new college

router.post("/register", verify, async (req, res) => {
  //Validating the data before creating the college

  const { error } = collegeRegisterValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, password } = req.body;

  const firstLetterOfCode = name[0];

  var secondLetterOfCode = name[5];

  if (secondLetterOfCode === " ") {
    secondLetterOfCode = name[6];
  }

  var collegeCode =
    firstLetterOfCode.toUpperCase() + secondLetterOfCode.toUpperCase();

  //Hashing the password
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  let college = new College({
    name: name,
    code: collegeCode,
    hashedPassword: hashPassword,
  });

  try {
    collegeData = await College.findOne({ name: name });

    if (collegeData) {
      return res
        .status(400)
        .json({ status: "error", message: "College already exists" });
    }
    savedCollege = await college.save();
    res.status(200).send({ message: "College registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

//Getting all registered colleges

router.get("/allColleges", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  try {
    const data = await College.find().limit(limit).skip(startIndex);
    return res.status(200).json({ colleges: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
});

// Editing the college
//Registering new college

router.put("/:id", verify, async (req, res) => {
  //College Id
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid College Id" });
  }

  const { id } = req.params;
  //Validating the data before creating the college

  const { error } = collegeUpdationValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name } = req.body;

  const firstLetterOfCode = name[0];

  var secondLetterOfCode = name[5];

  if (secondLetterOfCode === " ") {
    secondLetterOfCode = name[6];
  }

  var collegeCode =
    firstLetterOfCode.toUpperCase() + secondLetterOfCode.toUpperCase();

  var data = {
    name: name,
    code: collegeCode,
  };

  try {
    await College.findByIdAndUpdate(id, data);
    res.status(200).send({ message: "College updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
