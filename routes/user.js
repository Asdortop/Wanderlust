const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req,res)=> {
    res.render("users/signup.ejs")
})

router.post("/signup", wrapAsync(async (req,res) => {
        const {username, email, password} = req.body;
        const newUser = new User({username, email});
        const registerdUser = await User.register(newUser, password);
        console.log(registerdUser);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
}));

router.get("/login", (req,res)=> {
    res.render("users/login.ejs")
});

router.post("/login" , passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true }), 
    wrapAsync(async (req,res) => {
    // const {username, password} = req.body;
    // const user = await authenticateUser(req, res);
    req.flash("success", "Welcome back to Wanderlust!");
    res.redirect("/listings");
    }));

module.exports = router;