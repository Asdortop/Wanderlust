const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a new listing");
        return res.redirect("/user/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if (req.session.redirectUrl) {
        // Clear the redirect URL after saving it
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (req.user && !(req.user._id.equals(listing.owner._id))) {
        req.flash("error", "You do not have permission to edit this listing.");
        return res.redirect(`/listings/${id}`);
    };

    next();
};



module.exports.validateListing = (req, res, next) => {
    if (!req.body?.listing) {
        throw new ExpressError("Listing data missing", 400);
    }

    let img = req.body.listing.image;

    // Convert to object even if empty string
    if (typeof img === 'string' && img.trim() !== "") {
    req.body.listing.image = {
        filename: "listingimage",
        url: img.trim()
    };
} else {
    delete req.body.listing.image; // Let EJS fallback work
}


    let { error } = listingSchema.validate(req.body);
    console.log("Validation Result:", error);

    if (error) {
        let errDetails = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(errDetails, 400);
    }

    next();
};


module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    console.log("Validation Result:", error);

    if (error) {
        let errDetails = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(errDetails, 400); // ✅ corrected order
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};