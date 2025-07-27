const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");


//index route to show all listings
router.get("/", wrapAsync(listingController.index));


//new listing creating route to connect to the form
// this will render the form to create a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm); 


// read each listing route

router.get("/:id", wrapAsync(listingController.showListing));


// create new listing route where u can enter the details of the listing
// this will handle the form submission and save the new listing to the database
router.post("/",isLoggedIn, validateListing, wrapAsync(listingController.createListing)
);


//Edit Route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


// Update Route

router.put("/:id", isLoggedIn,isOwner, validateListing, wrapAsync(listingController.updateListing));

// Delete Route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;