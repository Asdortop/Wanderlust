const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");


router
//index route to show all listings
// create new listing route where u can enter the details of the listing
// this will handle the form submission and save the new listing to the database
 .route("/")
 .get( wrapAsync(listingController.index))
 .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing)
 );

 //new listing creating route to connect to the form
// this will render the form to create a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm); 


router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put( isLoggedIn,isOwner, validateListing, wrapAsync(listingController.updateListing))
.delete( isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

//Edit Route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;