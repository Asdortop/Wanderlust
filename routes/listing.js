const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");


//index route to show all listings
router.get("/", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
        
}));

//new listing creating route to connect to the form
// this will render the form to create a new listing
router.get("/new", isLoggedIn, (req,res) => {
    res.render("listings/new.ejs")
}); 

// read each listing route

router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate: {
        path: "author",
    },
    })
    .populate("owner");
    res.render("listings/show.ejs", {listing});
}));

// create new listing route where u can enter the details of the listing
// this will handle the form submission and save the new listing to the database
router.post("/",isLoggedIn, validateListing, wrapAsync(async (req,res) => {
    // Check if the request body contains a listing object
        if (!req.body.listing) {
            throw new ExpressError("Send valid data for listing", 400); // 400 Bad Request
        }
        const listingData = req.body.listing;
    
        // Convert image string to object format to match existing data structure
        if (listingData.image && typeof listingData.image === 'string') {
        listingData.image = {
            filename: "listingimage",
            url: listingData.image
            };
        }
    
        const newListing = new Listing(listingData);
        newListing.owner = req.user._id; // Set the owner to the logged-in user
        await newListing.save();
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings");
})
);


//Edit Route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));


// Update Route

router.put("/:id", isLoggedIn,isOwner, validateListing, wrapAsync(async (req,res) => {
    if (!req.body.listing) {
        throw new ExpressError("Send valid data for listing", 400); // 400 Bad Request
    }
    let {id} = req.params;
    const updateData = req.body.listing;
    
    // Convert image string to object format to match existing data structure
    if (updateData.image && typeof updateData.image === 'string') {
        updateData.image = {
            filename: "listingimage",
            url: updateData.image
        };
    }
    await Listing.findByIdAndUpdate(id, updateData);
    req.flash("success", "listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:\n", deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

module.exports = router;