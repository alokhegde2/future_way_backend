const express = require("express");
const router = express.Router();

require("dotenv/config");

const College = require('../../models/college_data_model')

const verify = require('../../helpers/verify_token')

const { collegeRegisterValidation } = require('../../validation/registration/college_registration_validation')


//Registering new college

router.post('/register', verify, async (req, res) => {
    //Validating the data before creating the college

    const { error } = collegeRegisterValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name } = req.body;

    const firstLetterOfCode = name[0];

    var secondLetterOfCode = name[5];

    if (secondLetterOfCode === " ") {
        secondLetterOfCode = name[6];
    }

    var collegeCode = firstLetterOfCode.toUpperCase() + secondLetterOfCode.toUpperCase()

    let college = new College({
        name: name,
        code: collegeCode
    })

    try {
        collegeData = await College.findOne({"name":name})

        if(collegeData){
            return res.status(400).json({"status":"error","message":"College already exists"})
        }
        savedCollege = await college.save();
        res.status(200).send({ message: "College registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
})


//Getting all registered colleges

router.get('/allColleges', verify, async (req, res) => {

    try {
        const data = await College.find()
        return res.status(200).json({ colleges: data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });
    }
})


module.exports = router;