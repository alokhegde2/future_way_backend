const Joi = require("joi");

//Register validation

const categoryCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().default("").optional(),
  });

  return schema.validate(data);
};

/**
 * Category Pricing validation
 */

const pricingValidation = (data) => {
  const schema = Joi.object({
    collegeId: Joi.string().required(),
    categoryId: Joi.string().required(),
    price: Joi.number().required(),
  });

  return schema.validate(data);
};

module.exports.categoryCreationValidation = categoryCreationValidation;
module.exports.pricingValidation = pricingValidation;
