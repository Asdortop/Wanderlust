const Listing = require("../models/listing.js");

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
        
}

module.exports.renderNewForm =  (req,res) => {
    res.render("listings/new.ejs")
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate: {
        path: "author",
    },
    })
    .populate("owner");
    res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async (req,res) => {
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
}


module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}


module.exports.updateListing = async (req,res) => {
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
}


module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:\n", deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}