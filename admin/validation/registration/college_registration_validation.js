const Joi = require("joi");

//Register validation

const collegeRegisterValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
    });

    return schema.validate(data);
};

module.exports.collegeRegisterValidation = collegeRegisterValidation;