const express = require("express");
const mongoose = require("mongoose");

require("dotenv/config");

const app = express();

const History = require("../../models/history_model");

const verify = require("../../helpers/verify_token");
const logger = require("../../helpers/logger");

/**
 * Getting student watch histroty
 * It only returns the todays watch history
 */
app.get("/history-status/:studentId", verify, async (req, res) => {
  const { studentId } = req.params;

  //Check student id is proper or not
  if (!mongoose.isValidObjectId(req.params.studentId)) {
    logger.log({
      level: "error",
      message: `Student| Invalid Student ID`,
    });
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  //Getting the todays watch history

  var todaysDate = new Date().setHours(0, 0, 0, 0);
  const watchHistory = await History.find({
    watchedOn: { $gt: todaysDate },
    student: studentId,
  });

  if (!watchHistory) {
    return res
      .status(400)
      .json({ status: "error", message: "Unable to get the watch history" });
  }

  return res.status(200).json({
    status: "success",
    watchHistory: watchHistory,
    count: watchHistory.length,
  });
});

/**
 * Checking for the watching course is new one or old one
 */
app.get("/history-status/:studentId/:courseId", verify, async (req, res) => {
  const { studentId, courseId } = req.params;

  //Check student id is proper or not
  if (!mongoose.isValidObjectId(studentId)) {
    logger.log({
      level: "error",
      message: `Student| Invalid Student ID`,
    });
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  //Check course id is proper or not
  if (!mongoose.isValidObjectId(studentId)) {
    logger.log({
      level: "error",
      message: `history.js | /history-status/:studentId/:courseId | Invalid Course ID`,
    });
    return res.status(400).json({ message: "Invalid Course Id" });
  }

  //Getting the todays watch history

  var todaysDate = new Date().setHours(0, 0, 0, 0);
  const watchHistory = await History.find({
    course: courseId,
    student: studentId,
  });

  if (watchHistory.length > 0) {
    return res.status(200).json({
      status: "success",
      message: "Already Watched",
      code: "already-watched",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "New Video",
    code: "not-already-watched",
  });
});

/**
 * Adding the course to the watch history
 * If the user watches every new video we have to record the date and course data
 * This will help in blocking user to watch daily 3 new videos condition
 */
app.post("/add-histroy", verify, async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    logger.log({
      level: "error",
      message: `History| /add-history | Student Id and Course Id are required`,
    });
    return res.status(400).json({
      status: "error",
      message: "Student Id and Course Id are required",
    });
  }

  //Verifying both the id
  //Check student id is proper or not
  if (!mongoose.isValidObjectId(studentId)) {
    logger.log({
      level: "error",
      message: `History| /add-history | Invalid Student Id`,
    });
    return res.status(400).json({ message: "Invalid Student Id" });
  }

  //Check student id is proper or not
  if (!mongoose.isValidObjectId(courseId)) {
    logger.log({
      level: "error",
      message: `History| /add-history | Invalid Course Id`,
    });
    return res.status(400).json({ message: "Invalid Course Id" });
  }

  const history = new History({
    course: courseId,
    student: studentId,
    watchedOn: Date.now(),
  });

  try {
    //Check if the course already in history of the student

    var historyStatus = await History.find({
      student: studentId,
      course: courseId,
    });

    if (historyStatus.length === 0) {
      await history.save();
    }

    return res.status(200).json({
      status: "success",
      message: "Course added to history successfully!",
    });
  } catch (error) {
    logger.log({
      level: "error",
      message: `History| /add-history | Error: ${error}`,
    });

    return res
      .status(400)
      .json({ status: "error", message: "Some error occured", error: error });
  }
});

module.exports = app;
