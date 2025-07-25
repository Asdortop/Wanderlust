const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('').required(),
    price: Joi.number().required().min(0),
    location: Joi.string().allow('').required(),
    country: Joi.string().allow('').required(),
    image: Joi.object({
      filename: Joi.string().required(),
      url: Joi.string().uri().required()
    }).optional()
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().allow('').required()
  }).required()
});