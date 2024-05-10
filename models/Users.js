import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    _id : {
        type: String,
        required: true,
    },
    username : {
        type : String,
        required : true,
    },
    userType : {
        type: String,
        required: true,
    },
    email : {
        type : String,
        required: false,
    },
    authToken : {
        type : String,
        required : true,
    },
    avatar: {
        type: String,
        required: false,
    },
    birthday: {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        required: false,
    },
    fullName : {
        type : String,
        required: false,
    },
    ships: {
        type: Number,
        required: true,
        default: 0,
    },
    gold: {
        type: Number,
        required: true,
        default: 0,
    },
    level: {
        type: Number,
        required: true,
        default: 0,
    },
    levelPercent : {
        type: Number,
        required: true,
        default: 0
    },
    firstLogin : {
        type: Boolean,
        required: true,
        default: true,
    },
    avatar64: {
        type: String,
        required: false,
    },
    roomId : {
        type: String,
        default: null
    }
})

const User = mongoose.model('User', userSchema);

export default User


