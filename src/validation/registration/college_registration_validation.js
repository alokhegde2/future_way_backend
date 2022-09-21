const Joi = require("joi");

//Register validation

const collegeRegisterValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    password: Joi.string().min(6).max(18).required(),
  });

  return schema.validate(data);
};

const collegeUpdationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().min(1).required(),
    password: Joi.string().min(3).required(),
  });

  return schema.validate(data);
};

module.exports.collegeRegisterValidation = collegeRegisterValidation;
module.exports.collegeUpdationValidation = collegeUpdationValidation;
module.exports.loginValidation = loginValidation;
