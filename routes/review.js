const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access listing ID in review routes
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const { isLoggedIn, validateReview } = require('../middleware.js');



// Add Review Route
// This route handles the submission of a new review for a specific listing

router.post("/",validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash('success', 'Review added successfully!');
    console.log("New Review Added");
    res.redirect(`/listings/${listing._id}`); // Redirect to the listing page after adding the review

}));

// Delete Review Route
// This route handles the deletion of a review for a specific listing
router.delete("/:reviewId", wrapAsync(async(req,res )=> {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    console.log("Review Deleted");  
    res.redirect(`/listings/${id}`);
}));

module.exports = router;