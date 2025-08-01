const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access listing ID in review routes
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const { isLoggedIn, validateReview , isReviewAuthor } = require('../middleware.js');
const reviewController = require("../controllers/reviews.js")



// Add Review Route
// This route handles the submission of a new review for a specific listing

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete Review Route
// This route handles the deletion of a review for a specific listing
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;