const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:""
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    publicKey: {
        type: Object,
        default: null
    }
},{timestamps:true}
);

const User = mongoose.model('User', userSchema);
module.exports = User;