const express = require("express");
const path = require("path");
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

//user sign up
router.get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/public/sign-up.html'));
  });
  
router.post('/api/register-user', async (req, res) => {
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
  



module.exports = router