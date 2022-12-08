const Joi = require("joi");

//Register validation

const studentRegisterValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().min(2).required(),
    phoneNumber: Joi.string().min(10).max(14).required(),
    isPaid: Joi.boolean().default(true),
    isPartialPayment: Joi.boolean().default(false),
    modeOfPayment:Joi.string().required(),
    collegeId: Joi.string().required(),
    categorySubscribedId: Joi.array().required(),
    dateOfPayment: Joi.date().required(),
  });

  return schema.validate(data);
};

// Update validation
const studentUpdateValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().min(2).required(),
    phoneNumber: Joi.string().min(10).max(14).required(),
    isPaid: Joi.boolean().default(true),
    collegeId: Joi.string().required(),
  });

  return schema.validate(data);
};
module.exports.studentRegisterValidation = studentRegisterValidation;
module.exports.studentUpdateValidation = studentUpdateValidation;
