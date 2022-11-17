
//dependencies
const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


const JWT_SECRET = 'aksjhfdkjhdsafkjh^^^^7sa@@$%saf.dsfkahd%sfkjhsadk(((*jfhv1&487319'
//db connection link w/ pw
require('dotenv/config');

//adding in db schemas
const User = require('./models/users')
const Org = require('./models/orgs');
const Post = require('./models/post')

const { restart } = require("nodemon");


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(express.static('public'));
app.use(bodyParser.json())


router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/home.html'));
});

router.get('/donate',function(req,res){
  res.render('donate')
});

router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/public/about.html'));
});

router.get('/contact',function(req,res){
  res.sendFile(path.join(__dirname+'/public/contact.html'));
});





router.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/public/login.html'));
});
app.post('/api/login', async (req, res) =>{
  const {email, password} = req.body

  //const user = await User.findOne({email}).lean()
  const org = await Org.findOne({email}).lean()
  
  if(!org){
    return res.json({status: 'error', error: 'Invalid username/password'})
  }

  if(await bcrypt.compare(password, org.password)){
    // the username, password combination is successful
    const token = jwt.sign({
      id: org._id,
      org: true
    },JWT_SECRET)
    return res.json({ status: 'ok', data: token})
    
  }
  res.json({status: 'ok', error: 'Invalid username/password'})
})




//user sign up
router.get('/sign-up',function(req,res){
  res.sendFile(path.join(__dirname+'/public/sign-up.html'));
});

app.post('/api/register-user', async (req, res) => {
  const {firstName, lastName, birthdate, email, password: plainTextPassword } = req.body;
  const password = await bcrypt.hash(plainTextPassword, 10)

  if(!email || typeof email !== 'string') {
    return res.json({status: 'error', error: 'invalid username'})
  }
  if(!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({status: 'error', error: 'invalid password'})
  }

  try{
    const response = await User.create({
      firstName,
      lastName,
      birthdate,
      email,
      password
    })
    console.log('User created successfully: ' + response)
  } catch(error){
    if(error.code === 11000){
      return res.json({status: 'error', error: 'Account Associated With This Email'})
    }
    throw error
  }
  
  res.json({status: 'ok'})
})





router.get('/org-signup',function(req, res){
  res.sendFile(path.join(__dirname+'/public/organization-signup.html'));
});

app.post('/api/register-org', async (req, res) => {
  const {orgName, firstName, lastName, address, city, state, zip,
     email, password: plainTextPassword } = req.body;
  const password = await bcrypt.hash(plainTextPassword, 10)

  if(!email || typeof email !== 'string') {
    return res.json({status: 'error', error: 'invalid username'})
  }
  if(!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({status: 'error', error: 'invalid password'})
  }

  try{
    const response = await Org.create({
      orgName,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      email,
      password
    })
    console.log('Org created successfully: ' + response)
  } catch(error){
    if(error.code === 11000){
      return res.json({status: 'error', error: 'Account Associated With This Email'})
    }
    throw error
  }
  
  res.json({status: 'ok'})
})




router.get('/forgot-password',function(req,res){
  res.sendFile(path.join(__dirname+'/public/forgot-password.html'));
});




router.get('/org-page',function(req,res){
  res.sendFile(path.join(__dirname+'/public/organization-page.html'));
});





router.get('/org-info',function(req,res){
  res.sendFile(path.join(__dirname+'/public/organization-info.html'));
});






router.get('/user-info',function(req,res){
  res.sendFile(path.join(__dirname+'/public/user-info.html'));
});

router.get('/password-reset',function(req,res){
  res.sendFile(path.join(__dirname+'/public/reset-password.html'));
});
app.post('/api/change-password', async (req, res) => {
  const {token, newPassword: plainTextPassword} = req.body
  try{
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id
    const password = await bcrypt.hash(plainTextPassword)
    await User.updateOne(
    {_id},
    {
      $set: {password}
    })
    res.json({status: 'okay'})
  } catch(error){
    res.json({ status: 'error', error:'124a'})
  }
  const user = jwt.verify(token, JWT_SECRET)

  console.log(user)
  res.json({status: 'ok'})

})



//connect to db
mongoose.connect(
  process.env.MONGODB_URL, {useNewUrlParser : true}, () =>
  console.log('Connected to DB.')
  );


app.use("/", router);
app.listen(process.env.port || 3000);

console.log("Running at Port 3000");