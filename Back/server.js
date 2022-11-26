
//dependencies
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const fs = require('fs');

const JWT_SECRET = 'aksjhfdkjhdsafkjh^^1&487319'
//db connection link w/ pw
require('dotenv/config');
//adding in db models
const User = require('./models/users')
const Org = require('./models/orgs');
const Post = require('./models/post')
const { restart } = require("nodemon");
const { response } = require("express");
//image storage
const multer = require('multer');
const { json } = require("body-parser");
const { doesNotMatch } = require("assert");
  
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage });

//set path for ejs views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(express.static('public'));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}))

//static html files//
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/home.html'));
});
app.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/public/about.html'));
});
app.get('/contact',function(req,res){
  res.sendFile(path.join(__dirname+'/public/contact.html'));
});
app.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/public/login.html'));
});
app.get('/sign-up',function(req,res){
  res.sendFile(path.join(__dirname+'/public/organization-signup.html'));
});
app.get('/org-signup',function(req, res){
  res.sendFile(path.join(__dirname+'/public/organization-signup.html'));
});
app.get('/forgot-password',function(req,res){
  res.sendFile(path.join(__dirname+'/public/forgot-password.html'));
});
app.get('/logout',function(req, res, next){
  res.clearCookie("token");
  res.redirect('/login');
})

//post requests
app.post('/api/sign-up', async (req, res) => {
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
  
})

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

app.post('/api/login', async (req, res) => {
  const {email, password} = req.body
  const org =  await Org.findOne({email}).lean()
  if(!org) {
    return res.json({status: 'error', error: 'Invalid Username/Password'})
  }

  if(await bcrypt.compare(password, org.password)){
    //username and password combo is successful 
    const token = jwt.sign({
      id: org._id, 
      email: org.email,
      org: true
    },JWT_SECRET)
    res.cookie("token", token, {
      httpOnly: true
    })
    console.log("User logged in")
    return res.json({status: 'ok', data: token})
  }

  res.json({status: 'error', error: 'Invalid Username/Password'})
})

app.post('/api/change-password', async (req, res) => {
  const {token, newpassword: plainTextPassword} = req.body

  try{
    const user = jwt.verify(token, JWT_SECRET) // verifies token
    const _id = user.id
    const password = await bcrypt.hash(plainTextPassword, 10)
    await Org.updateOne(
      { _id }, 
      {
        $set: {password}
      }
    )
    res.json({status: 'ok'})
  } catch (error){
    res.json({status: 'error', error: ';)'})
  }
  
})

app.post('/upload-post', upload.single('image'), async (req, res, next) => {
  const token = req.cookies.token
  const user = jwt.verify(token, JWT_SECRET)
  const _id = user.id
  const org =  await Org.findOne({_id}).lean()

  var obj = {
      orgID: _id,
      name: org.orgName,
      orgCity: org.city,
      description: req.body.desc,
      image: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: '  /png'
      }
  }
    Post.create(obj, (err, item) => {
      if (err) {
        res.json({status: 'error', error: 'Cannot Create Another Post'})
      }
      else {
          // item.save();
          res.redirect('/user-info');
      }
  });
});

app.post('/edit-post', upload.single('image'), async (req,res) => {
  const token = req.cookies.token
  const user = jwt.verify(token, JWT_SECRET)
  const orgID = user.id
  var myquery = {orgID: orgID}
  var newvalues = { $set: {description: req.body.desc, image: {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: '  /png'
  }}};
  await Post.updateOne(myquery, newvalues, (err, res) => {
    if (err) throw err;
  }).clone()
  res.redirect('/user-info')
})



//dynamic ejs files//
app.get('/create-orgpage',function(req,res){
  res.render('create-orgpost')
});
app.get('/org-page',async function(req,res){
  const orgName = req.cookies.orgName
  const name = req.cookies.orgName
  const post = await Post.findOne({name}).lean()
  const org = await Org.findOne({orgName}).lean()
  res.render('org-info', {
    orgName: org.orgName,
    image: post.image,
    description: post.description,
    email: org.email,
    address: org.address + " " + org.city + ", " + org.state,
  })
});

app.get('/donate',function(req,res){
  var finalData = []
  res.render('donate', {posts: finalData})
});

app.post('/donate', async (req, res) => {
  const searchInput = req.body.search
  const searchInput2 = req.body.search
  console.log(searchInput2)
  var finalData = []
  var data1 = await Post.find({orgCity: searchInput}, (err, data) => {
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
      }else{
        //dataOne = dataOne.concat(data) 
        //console.log(dataOne)
        return data
      }
    }).clone().collation({locale: 'en', strength: 2})
  
  var data2 = await Post.find({name: searchInput2}, (err, data2) =>{
      if(err){
          console.log(err)
          res.status(500).send('An error occurred', err);
      }else{
        return data2
        }
        
      }).clone().collation({locale: 'en', strength: 2})

      finalData = data1.concat(data2)
      res.render('donate', {posts: finalData})
});

app.get('/user-info', async function(req,res){
  const token = req.cookies.token
  //const user = jwt.verify(token, JWT_SECRET)
  if(!token){
    res.redirect('/login')
  }else{
  const user = jwt.verify(token, JWT_SECRET)
  const _id = user.id
  const org =  await Org.findOne({_id}).lean()
  if(org){
  res.render('user-info', {
    orgName: org.orgName,
    firstName: org.firstName,
    lastName: org.lastName,
    email: org.email,
    city: org.city + ", " + org.state,
  })}
  }
});

app.get('/password-reset',function(req,res){
  res.sendFile(path.join(__dirname+'/public/reset-password.html'));
});

//connect to db
mongoose.connect(
  process.env.MONGODB_URL, {useNewUrlParser : true}, () =>
  console.log('Connected to DB.')
  );

//use router and listen to the port 5000 to host server

app.listen(process.env.port || 5000);

console.log("Running at Port 5000");