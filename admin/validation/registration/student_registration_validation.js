const Joi = require("joi");

//Register validation

const studentRegisterValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        email: Joi.string().min(2).required(),
        phoneNumber: Joi.string().min(10).max(14).required(),
        password: Joi.string().min(6).max(12).required(),
        isPaid:Joi.boolean().default(true),
        collegeId:Joi.string().required(),
        categorySubscribedId:Joi.array().required(),
    });

    return schema.validate(data);
};

module.exports.studentRegisterValidation = studentRegisterValidation;