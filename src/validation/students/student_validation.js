const Joi = require("joi");

//Login validation

const studentLoginValidation = (data) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().min(10).max(14).required(),
    deviceId: Joi.string().required(),
    loginFrom:Joi.string().required()
  });

  return schema.validate(data);
};

module.exports.studentLoginValidation = studentLoginValidation;
