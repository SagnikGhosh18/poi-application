const Joi = require('joi');

const schemas = {
    register: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).max(128).required()
    }),

    login: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).max(128).required()
    }),

    createPost: Joi.object({
        imageUrl: Joi.string().uri().required(),
        caption: Joi.string().max(2000).allow('', null)
    }),

    postId: Joi.object({
        id: Joi.string().uuid().required()
    })
};

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details[0].message
            });
        }
        next();
    };
};

module.exports = { schemas, validate };