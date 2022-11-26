const mongoose = require('mongoose');
const Schema3 = mongoose.Schema;


//create user schema
const postSchema = new Schema3({
    orgID: {type: String, require: true, unique: true},
    name: {type: String, require: true, unique: true},
    orgCity: {type: String, require: true},
    description: {type: String, require: true},
    //needs: {type: String, require: true},
    image: {data: Buffer, contentType: String}
}, {collection: 'posts'},)

//creates the user model that saves to the db
const Post = mongoose.model('Post', postSchema, 'posts');


//exports to use in other files
module.exports = Post;