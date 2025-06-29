const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

// index route for listings

app.get("/listings", async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
        
});

//new listing creating route to connect to the form
// this will render the form to create a new listing
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs")
}); 

// create new listing route where u can enter the details of the listing
// this will handle the form submission and save the new listing to the database
app.post("/listings", async (req,res) => {
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
});


//Edit Route

app.get("/listings/:id/edit", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});


// Update Route

app.put("/listings/:id", async (req,res) => {
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
});

// Delete Route
app.delete("/listings/:id", async (req,res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:\n", deletedListing);
    res.redirect("/listings");
});

// read each listing route

app.get("/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});


// server setup
app.listen(8080, () =>{
    console.log("Server is running on port 8080");
});