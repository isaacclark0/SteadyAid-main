const mongoose = require('mongoose');
const Schema2 = mongoose.Schema;

const orgSchema = new Schema2({
    orgName: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zip: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
}, {collection: 'orgs'})
const Org = mongoose.model('Org', orgSchema, 'orgs');

module.exports = Org;