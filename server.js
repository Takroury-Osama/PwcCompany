const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const md5 = require('md5');
const jwt = require('jsonwebtoken');

const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())



//Any one can access website (your IP) //allow proxy //* means all
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


//Connection in mongoDB
const db = mongoose.connect('mongodb://localhost/ComplaintCompany',{
    useNewUrlParser: true ,
    useUnifiedTopology: true
})


const User = require('./model/user');


//Register user page
app.post('/user' , function (req,res){

  console.log('In Register Page');

   let newUser = User()
   newUser.userName= req.body.userName
   newUser.userEmail= req.body.userEmail
   newUser.userPassword= md5(req.body.userPassword)
   newUser.userIsAdmin= req.body.userIsAdmin

   newUser.save(function(err, SavedUser) {

     if(err) {
       res.status(500).send(err)
       console.log(err);
     }
     else {
       res.send(SavedUser)
       console.log('you are user now...');
     }
   })
 })

//Show users for admin
 app.get('/users' , function (req,res){

   let token = req.body.token
   jwt.verify(token, process.env.secret_code_token, function(err, decoded) {
     if(decoded) {
       User.find({}, function (err, UserFound) {
         if(err) {
           re.send(500).send(err)
           console.log(err);
         }
         else {
           res.send(UserFound)
         }
       })
     }
     else
        {
         res.status(500).send({error: "You have no authentication to access"})
       }
     })

   User.find({}, function(err, State) {
     if(err) {
       res.status(500).send(err)
       console.log(err);
     }
     else {
       res.send(State)
     }
   })
 });

//Login user Page
 app.get('/login' , function (req,res){

   let Email = req.query.userEmail        //to send parameters to (get) >>>>> use ((query))
   let Password = req.query.userPassword
   //console.log(req);
   User.find({userEmail: Email}, function(err, UserFound) {
     if(err) {
       res.status(500).send(err)
       console.log(err);
     }

     else {
       if(UserFound[0].userPassword == md5(Password)) {
         let token = jwt.sign({ userEmail: UserFound[0].userEmail , userIsAdmin: UserFound[0].userIsAdmin }, process.env.secret_code_token , { expiresIn: '1h' } );
         console.log(token)

         let LoginRes = {
           token: token,
           userEmail: UserFound[0].userEmail,
           userName: UserFound[0].userName,
           userIsAdmin: UserFound[0].userIsAdmin
         }
         res.send(LoginRes)
       }

       else {
         res.send({message: "Wrong Password, please try again"})
       }
     }
   })
 })




//check port listening
app.listen(4000, function() {
    console.log("Server is running on port 4000")
})
