const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User  = require('../schemas/UserSchema');


app.set("view engine", "pug");
app.set("views","views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res,next) => {
    res.status(200).render("register");
})


router.post("/", async (req, res,next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;
    var payload = req.body;

    if(firstName && lastName && username && email && password){
        // Add to DB 
        var user = await User.findOne({
         $or: [
            { username: username },
               { email: email }
         ]
        }).catch((err) =>{
            console.log(error)

            // if there is error the message will show off in the form 
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("register", payload);
        });

        if(user == null){
            // No user found 
            var data = req.body;

            // To secure the password - 10 is encrypt the password ten times
            data.password = await bcrypt.hash(password, 10);
            
             User.create(data)
             .then( (user) => {
                req.session.user = user;
                return res.redirect("/");
             })
        } 
        else {
            // user found 
            if( email == user.email ){
                payload.errorMessage = "Email already in use.";
            } else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render("register", payload);
        }

        
    } else { 
        // if there is error the message will show off in the form 
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload);
    }

    
})

module.exports = router;