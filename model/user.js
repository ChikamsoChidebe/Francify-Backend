const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

userSchema.methods.generateAuthToken = function() {
    const payload = { id: this._id, isAdmin: this.isAdmin };
    const JWT_SECRET = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };
    return jwt.sign(payload, JWT_SECRET, options);
};

userSchema.statics.verifyToken = function(token) {
    const JWT_SECRET = process.env.JWT_SECRET;
    return jwt.verify(token, JWT_SECRET);
};

const User = mongoose.model('user', userSchema);
module.exports = User;