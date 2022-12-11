const express = require("express");
const router = express.Router();

require("dotenv/config");

const verify = require("../../helpers/verify_token");

const Category = require("../../models/category_model");
const Course = require("../../models/course_model");
const College = require("../../models/college_data_model");
const Student = require("../../models/student_model");

router.get("/dashboard", verify, async (req, res) => {
  try {
    //Getting category count
    var categoryCount = await Category.count();

    //Getting course count
    var courseCount = await Course.count();

    //Getting college count
    var collegeCount = await College.count();

    //Getting count of the studenst
    var studentCount = await Student.find({ isDisabled: false }).count();

    var responseData = {
      categoryCount: categoryCount,
      courseCount: courseCount,
      collegeCount: collegeCount,
      studentCount: studentCount,
    };

    return res.status(200).json({ status: "success", allCounts: responseData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});


/**
 * Verify Device Id
 */


module.exports = router;
