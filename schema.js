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
    }).required()
  }).required()
});
