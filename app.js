const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

// Connect to MongoDB

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
})


async function main(){
    await mongoose.connect(MONGO_URL);
}

//ejs setup
app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static("public"));


//basic route
app.get('/', (req,res)=>{
    console.log("hi mannn");
    res.send("server's is running finee")
})

const validateListing = (req, res, next) => {
    // Convert image string to object BEFORE validation
    if (req.body?.listing?.image && typeof req.body.listing.image === 'string') {
        req.body.listing.image = {
            filename: "listingimage",
            url: req.body.listing.image
        };
    }

    let { error } = listingSchema.validate(req.body);
    console.log("Validation Result:", error);

    if (error) {
        let errDetails = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(errDetails, 400); // ✅ corrected order
    } else {
        next();
    }
};


// index route for listings

app.get("/listings", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
        
}));

//new listing creating route to connect to the form
// this will render the form to create a new listing
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs")
}); 

// create new listing route where u can enter the details of the listing
// this will handle the form submission and save the new listing to the database
app.post("/listings",validateListing, wrapAsync(async (req,res) => {
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
        res.redirect("/listings");
})
);


//Edit Route

app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));


// Update Route

app.put("/listings/:id",validateListing, wrapAsync(async (req,res) => {
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
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:\n", deletedListing);
    res.redirect("/listings");
}));

// read each listing route

app.get("/listings/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

app.all(/.*/, (req, res) => {
    throw new ExpressError("Page Not Found", 404);
});


app.use((err,req,res,next) => {
    let {message="Something went wrong", statusCode=500} = err;
    console.log("Error:", message, "Status Code:", statusCode);
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
});
// server setup
app.listen(8080, () =>{
    console.log("Server is running on port 8080");
});