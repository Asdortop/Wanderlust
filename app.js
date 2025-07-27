const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session =  require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


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


//session setup
const sessionOptions = {
    secret: "thisismysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000, // 7 days
        maxAge: 7*24*60*60*1000, // 7 days
        httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    }
};

//basic route
app.get('/', (req,res)=>{
    console.log("hi mannn");
    res.send("server's is running finee")
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/user", userRouter);




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