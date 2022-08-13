const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

require("dotenv/config");

const verify = require('../../helpers/verify_token')

const Category = require('../../models/category_model')
const Course = require('../../models/course_model')


const { courseCreationValidation } = require('../../validation/courses/course_validation');


//Creating the new course
router.post('/create', verify, async (req, res) => {
    const { courseName, courseDescription, categoryId, thumbnailUrl, insideThumbnailUrl, videoUrl } = req.body;



    const { error } = courseCreationValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    if (!mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({ message: "Invalid Category Id" });
    }

    const categoryData = await Category.findById(categoryId)

    if (!categoryData) {
        return { "status": "error", "message": "Category Doesn't Exists, Please choose the proper category." }
    }

    let course = new Course({
        name: courseName,
        description: courseDescription,
        category: categoryId,
        thumbnailUrl: thumbnailUrl,
        insideThumbnailUrl:insideThumbnailUrl,
        videoUrl: videoUrl
    })

    try {
        var savedCourse = await course.save()
        return res.status(200).send({ "status": "success", message: "Course Created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }

});

//Getting all the courses
router.get('/allCourses', verify, async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;


    try {
        const data = await Course.find().populate({
            path: "category",
            select: ['name', 'description']
        }).limit(limit).skip(startIndex)


        return res.status(200).json({ courses: data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error });
    }
})


//Getting single courses
router.get('/:id', verify, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid Course Id" });
    }

    try {
        const data = await Course.findById(req.params.id);

        return res.status(200).json({ course: data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error });
    }

})


module.exports = router;