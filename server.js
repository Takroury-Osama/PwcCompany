const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const md5 = require('md5');
const jwt = require('jsonwebtoken');



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())



//Any one can access website (your IP) //allow proxy //* means all
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Methods", "*");
  res.header('Content-Type','application/x-www-form-urlencoded')
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
});

mongoose.set("useCreateIndex", true);
app.use(cors());

//import all moduls files
const User = require('./model/user')
const Type = require('./model/type');
const Complaint = require('./model/complaint');


//Register user page
app.get('/user' , function (req,res){

  console.log('In Register Page');
   let newUser = User()
   newUser.userName= req.body.userName
   newUser.userEmail= req.body.userEmail
   newUser.userPassword= md5(req.body.userPassword)
   newUser.userIsAdmin= req.body.userIsAdmin

   newUser.save(function(err, SavedUser) {
     if(err) {
       res.status(500).send({error:"Could not sign up"})
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
 app.post('/login' , function (req,res){

  // console.log("In login Page");
  // let Email = req.query.userEmail        //to send parameters to (get) >>>>> use ((query))
  // let Password = req.query.userPassword


   let Email = req.body.userEmail
   let Password = req.body.userPassword

   var promise = new Promise(function (resolve, reject) {

   console.log(req.body);
   User.find({userEmail: Email}, function(err, UserFound) {
     if(err) {
       res.status(500).send({error:"Could not login"})
       console.log(err);
     }

     else {
       if (UserFound[0].userPassword == md5(Password)) {
         let token = jwt.sign({userEmail: UserFound[0].userEmail , userIsAdmin: UserFound[0].userIsAdmin }, process.env.secret_code_token , { expiresIn: '1h' } );
         console.log(token)

         let LoginRes = {
           token: token,
           userEmail: UserFound[0].userEmail,
           userName: UserFound[0].userName,
           userIsAdmin: UserFound[0].userIsAdmin,
           userPassword: UserFound[0].userPassword
         }
         res.send(LoginRes)
       }
       else {
         res.send({message: "Wrong Username or Password, please try again"})
       }
     }
   })
    });
 })


//__________form Complaint part ____________//

//Complaint form send data
 app.post('/complaint' , function (req,res){
     let NewComplaint = new Complaint()
     NewComplaint.complaintUserName = req.body.complaintUserName
     NewComplaint.complaintText = req.body.complaintText ;
     NewComplaint.typeId = req.body.complaintType ;
     NewComplaint.complaintStatus = req.body.complaintStatus ;

     NewComplaint.save(function(err,SavedComplaint){
         if (err) {
             res.status(500).send({error:"Could not send complaint"})
             console.log(err)
         } else {
             res.send(SavedComplaint)
         }
     })
 })

//get all complaint for admin page
 app.get('/complaints' , function (req,res){


     Complaint.find({}).populate(
     {
         path: 'typeId',
         model: 'Type',
         select : 'typeName'
     }
   ).exec(function(error,Complaints){
         if (error){
             res.status(500).send({Error:"Could not show complaints "})
         } else {

             res.send(Complaints);
         }
     })
 })

 app.get('/editcomplaint' , function (req,res){

    console.log('edit status');
    let complaintId = req.body.complaintId

    console.log(complaintId)

    Complaint.updateOne({_id :complaintId} , {$set : {complaintStatus : req.body.complaintStatus }} , (err,Status) => {
        if (err) {
            res.status(500).send({Error:'could not edit/ update'})
            console.log(err)
        } else {
            console.log('edit Status')
            res.send(Status)
        }
    }
)})


// update status for admin page
 app.put('/editcomplaint' , function (req,res){

    console.log('edit status');
    let complaintId = req.body.complaintId

    console.log(complaintId)

    Complaint.updateOne({_id :complaintId} , {$set : {complaintStatus : req.body.complaintStatus }} , (err,Status) => {
        if (err) {
            res.status(500).send({Error:'could not edit/ update'})
            console.log(err)
        } else {
            console.log('edit Status')
            res.send(Status)
        }
    }
)})
    // ----- end form ----


// selected type Complaint
app.post('/type', function(req, res) {
    let NewType = new Type()
    NewType.typeName = req.body.typeName

    NewType.save(function(err, SavedType) {
      if(err) {
        console.log(err)
        res.status(500).send({error:"Couldn't add new type"})
      }
      else {
        res.send(SavedType)
        console.log('new type added');
      }
    })
})

app.get('/types' , function (req,res){
    Type.find({} , function(error,Complaints){
        if (error){
            res.status(500).send({Error:"Coudn't get "})
        } else {

            res.send(Complaints);
        }
    })
})

//check port listening
app.listen(4000, function() {
    console.log("Server is running on port 4000")
})
