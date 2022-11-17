const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//create user schema
const userSchema = new Schema({
    firstName: {type: String, require: true},
    lastName: {type: String, require: true},
    birthdate: {type: String, require: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, required: true}
}, {collection: 'users'})

//creates the user model that saves to the db
const User = mongoose.model('User', userSchema, 'users');


//exports to use in other files
module.exports = User;