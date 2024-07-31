import mongoose from "mongoose";

const MemebersSchema = new mongoose.Schema({
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
    },
    members : {
        type: [MemebersSchema],
        required: true
    },
    requests : {
        type : [MemebersSchema],
        default: []
    }
})

const Club = mongoose.model('club', clubSchema);

export default Club