const mongoose = require('mongoose');

// Initializing Fiels for the User Model, i.e, Name, Email, Password, Avatar, Date
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true

    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// User Model takes in the Model name 'user' as well as the User Schema (Fields)
const User = mongoose.model('user', UserSchema);

module.exports = User;
