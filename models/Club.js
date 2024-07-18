import mongoose from "mongoose";

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

const Club = mongoose.model('club', clubSchema);

export default Club