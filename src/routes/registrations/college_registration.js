const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

require("dotenv/config");

const College = require("../../models/college_data_model");
const Student = require("../../models/student_model");

const verify = require("../../helpers/verify_token");

const {
  collegeRegisterValidation,
  collegeUpdationValidation,
  loginValidation,
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
  const hashPassword = await bcrypt.hash(password, salt);

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

/**
 * College Login
 */

router.post("/login", async (req, res) => {
  //Validating user details
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //Finding that email id is present or not
  const user = await College.findOne({ code: req.body.code });

  //if user not found
  if (!user) {
    return res.status(400).json({ message: "College code not found" });
  }

  //comparing two passwords one is user entered and another one is the actual password
  const validPass = await bcrypt.compare(
    req.body.password,
    user.hashedPassword
  );

  //If passwords do not match
  if (!validPass) {
    return res.status(400).json({ message: "Invalid password" });
  }

  //importing secret password
  const secret = process.env.SECRET;

  //Creating jwt
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    secret,
    { expiresIn: "7d" }
  );

  //returning succes with header auth-token
  return res.status(200).header("auth-token", token).json({ authToken: token });
});

router.get("/dashboard/:id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid College Id" });
  }

  const { id } = req.params;

  try {
    var collegeName = await College.findById(id);

    if (collegeName === null) {
      return res
        .status(400)
        .json({ status: "error", message: "College not found" });
    }

    //Getting count of the studenst
    var studentCount = await Student.find({
      isDisabled: false,
      college: id,
    }).count();

    return res.status(200).json({
      status: "success",
      studentCount: studentCount,
      collegeName: collegeName.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error });
  }
});

module.exports = router;
