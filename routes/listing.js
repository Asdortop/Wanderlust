const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');

const validateListing = (req, res, next) => {
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



//index route to show all listings
router.get("/", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
        
}));

//new listing creating route to connect to the form
// this will render the form to create a new listing
router.get("/new", (req,res) => {
    res.render("listings/new.ejs")
}); 

// read each listing route

router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

// create new listing route where u can enter the details of the listing
// this will handle the form submission and save the new listing to the database
router.post("/",validateListing, wrapAsync(async (req,res) => {
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
        await newListing.save();
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings");
})
);


//Edit Route

router.get("/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));


// Update Route

router.put("/:id",validateListing, wrapAsync(async (req,res) => {
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
router.delete("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:\n", deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

module.exports = router;