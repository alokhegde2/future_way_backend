const express = require("express");
const router = express.Router();

require("dotenv/config");

const Category = require('../../models/category_model')

const verify = require('../../helpers/verify_token')

const { categoryCreationValidation } = require('../../validation/courses/category_validation')

//Creating new category

router.post('/new', verify, async (req, res) => {
    //Validating the submitted data
    const { error } = categoryCreationValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description } = req.body;

    let category = new Category({
        name: name,
        description: description
    })

    try {
        savedCategory = await category.save();
        res.status(200).send({ message: "Category Created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
});


router.get('/', verify, async (req, res) => { 
    try {
        const data = await Category.find()
        return res.status(200).json({ categories: data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });
    }
})


module.exports = router