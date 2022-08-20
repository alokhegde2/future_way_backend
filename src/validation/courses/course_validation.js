const Joi = require("joi");

//Register validation

const courseCreationValidation = (data) => {
    const schema = Joi.object({
        courseName: Joi.string().min(2).required(),
        courseDescription:Joi.string().default("").optional(),
        categoryId:Joi.string().required(),
        thumbnailUrl:Joi.string().required(),
        insideThumbnailUrl:Joi.string().required(),
        videoUrl:Joi.string().required()
    });

    return schema.validate(data);
};

module.exports.courseCreationValidation = courseCreationValidation;