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

/**
 * Subacription Creation validation
 */

const subscriptionValidation = (data) => {
  const schema = Joi.object({
    collegeId: Joi.string().required(),
    studentId: Joi.string().required(),
    categoryId: Joi.string().required(),
    isPaid: Joi.boolean().optional().default(false),
    modeOfPayment: Joi.string().optional().default("Offline"),
    isPartialPayment: Joi.boolean().optional().default(false),
    dateOfPayment: Joi.date().optional(),
  });

  return schema.validate(data);
};

/**
 * Update Subacription validation
 */

const updateSubscriptionValidation = (data) => {
  const schema = Joi.object({
    subscriptionId: Joi.string().required(),
    isPaid: Joi.boolean().optional().default(false),
    modeOfPayment: Joi.string().optional().default("Offline"),
    isPartialPayment: Joi.boolean().optional().default(false),
    dateOfPayment: Joi.date().optional(),
  });

  return schema.validate(data);
};

module.exports.categoryCreationValidation = categoryCreationValidation;
module.exports.pricingValidation = pricingValidation;
module.exports.subscriptionValidation = subscriptionValidation;
module.exports.updateSubscriptionValidation = updateSubscriptionValidation;
