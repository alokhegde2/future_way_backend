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

const studentLoginWebValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp:Joi.string().required()
  });

  return schema.validate(data);
};

const generateOtpValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  return schema.validate(data);
};

module.exports.studentLoginValidation = studentLoginValidation;
module.exports.studentLoginWebValidation = studentLoginWebValidation;
module.exports.generateOtpValidation = generateOtpValidation;
