const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role: { type: String, default: "User" },
    isAdmin: { type: Boolean, default: false }
},{timestamps:true});


const User = mongoose.model('user', userSchema);
module.exports = User;