import mongoose from "mongoose";


const requestSchema = new mongoose.Schema({
    _id : {
        type: String,
        required: true,
    },
    username : {
        type : String,
        required : true,
    },
    avatar: {
        type: String,
        required: false,
    },
    avatar64: {
        type: String,
        required: false,
    },
    requestType: {
        type: String,
        required: true,
    }
})

const clubSchema = new mongoose.Schema({
    _id : {
        type: String,
        required: true,
    },
    clubName: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    description : {
        type: String,
        required: true,
    },
    private : {
        type: Boolean,
        required: true,
        default: false
    },
    newGames: {
        type: Boolean,
        required: true,
        default: true
    },
    memberMessages : {
        type: Boolean,
        required: true,
        default: true
    },
    gameHosting: {
        type: String,
        required: true,
        default: "Member"
    },
    ownerName: {
        type: String,
        required: true,
    },
    ownerId: {
        type: String,
        required: true,
    }
})

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
    },
    clubs :  {
        type: [clubSchema], // Array of strings to hold card IDs or names
        default: null,
    },
    requests : {
        type : [requestSchema],
        default: []
    }
})

const User = mongoose.model('User', userSchema);

export default User


