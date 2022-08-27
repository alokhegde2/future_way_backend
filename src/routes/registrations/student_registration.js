const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

require("dotenv/config");

const College = require("../../models/college_data_model");

const Student = require("../../models/student_model");

const verify = require("../../helpers/verify_token");

const {
  studentRegisterValidation,
} = require("../../validation/registration/student_registration_validation");

//Registering new student

router.post("/register", verify, async (req, res) => {
  const { error } = studentRegisterValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, phoneNumber, isPaid, collegeId, categorySubscribedId } =
    req.body;

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
    categorySubscribed: categorySubscribedId,
  });

  //Saving all data
  try {
    savedstudent = await studentRegistration.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }

  return res
    .status(200)
    .json({ message: "Student Account Created Successfuly" });
});

router.get("/allStudents", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  try {
    //TODO: Add is diabled option in future
    const data = await Student.find()
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

// UPDATING THE STUDENT DATA

router.get("/:id", verify, async (req, res) => {
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

router.put("/:id", verify, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid Course Id" });
  }

  // VERIFYING THE DATA WHICH ARE SENT FROM THE BODY
  const { error } = studentRegisterValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // GETTING TALL THE DATA

  const { name, email, phoneNumber, isPaid, collegeId, categorySubscribedId } =
    req.body;

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
    categorySubscribed: categorySubscribedId,
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

// DELETING THE STUDENT CREATED
router.delete("/:id", verify, async (req, res) => {
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

module.exports = router;
