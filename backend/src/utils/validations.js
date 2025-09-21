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

    // --- MODIFIED HERE ---
    createPost: Joi.object({
        // imageUrl: Joi.string().uri().required(), // This line is removed
        caption: Joi.string().max(2000).allow('', null)
    }),
    // ---------------------

    postId: Joi.object({
        id: Joi.string().uuid().required()
    })
};

const validate = (schema) => {
    return (req, res, next) => {
        // This validation function now correctly checks req.body, which multer populates
        // with the text fields (like 'caption') from the multipart form.
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