import mongoose from "mongoose";


const handSchema = new mongoose.Schema({
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
    }
})

export default playerSchema