const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
})


async function main(){
    await mongoose.connect(MONGO_URL);
}
 const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data  =initdata.data.map((obj) => ({...obj, owner: "687f9e25a4ebaf50761c0971"})); // Assuming a default owner ID
    await Listing.insertMany(initdata.data);
    console.log("Database initialized with data");
 }

initDB();