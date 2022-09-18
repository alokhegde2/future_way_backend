const Joi = require("joi");

//Register validation

const studentRegisterValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().min(2).required(),
    phoneNumber: Joi.string().min(10).max(14).required(),
    isPaid: Joi.boolean().default(true),
    collegeId: Joi.string().required(),
    categorySubscribedId: Joi.array().required(),
    totalFees: Joi.number().required(),
    paidFees: Joi.number().required(),
    pendingFees: Joi.number().default(0),
    dateOfPayment: Joi.date().required(),
    renewalDate: Joi.date().required(),
  });

  return schema.validate(data);
};

module.exports.studentRegisterValidation = studentRegisterValidation;
