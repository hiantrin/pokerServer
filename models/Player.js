import mongoose from "mongoose";


export const handSchema = new mongoose.Schema({
    suit: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true
    }
})

const playerSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    currentCards: {
        type: [handSchema], // Array of strings to hold card IDs or names
        default: null,
    },
    currentTextEmoji: {
        type: String,
        default: "",
    },
    userShips: {
        type: Number,
        required: true
    },
    avatar : {
        type: String,
        required: false,
    },
    avatar64 : {
        type: String,
        required: false,
    },
    playerStatus: {
        type: String,
        default: "normal"
    },
    inTheGame: {
        type: Boolean,
        default: true
    },
    raised: {
        type: Number,
        default: 0
    },
    bet : {
        type : Number,
        default : 0
    },
    checked: {
        type: Boolean,
        default: false
    },
    robot: {
        type: Boolean,
        required: true
    },
    set : {
        type: Number,
        required: true
    },
    kicked : {
        type: Boolean,
        required: true,
        default: false
    },
    showCards : {
        type : Number,
        required: true,
        dafault: 0
    },
    gift: {
        type : String,
        required: true,
        dafault: ""
    },
    loseWin : {
        type : Number,
        required: true,
        default: 0
    }
})

export default playerSchema