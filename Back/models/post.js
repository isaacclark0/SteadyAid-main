const mongoose = require('mongoose');
const Schema3 = mongoose.Schema;


//create user schema
const postSchema = new Schema3({
    orgName: {type: String, require: true},
    postTitle: {type: String, require: true},
    description: {type: String, require: true},
    needs: {type: String, require: true},
    image: {type: String, require: true, unique: true},
}, {collection: 'posts'})

//creates the user model that saves to the db
const Post = mongoose.model('Post', postSchema, 'posts');


//exports to use in other files
module.exports = Post;