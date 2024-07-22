import mongoose from "mongoose";
import playerSchema from "./Player.js";

const pokerRoomSchema = new mongoose.Schema({
    roomId : {
        type: String,
        required: true,
        unique: true,
    },
    players: {
        type: [String],
        required: true,
    },
    buyIn : {
        type: Number,
        required: true
    },
    maxPlayers : {
        type: Number,
        required: true,
    },
    full : {
        type: Boolean,
        required: true,
    },
    playersData : {
        type : [playerSchema],
        default : [],
    },
    gameStarted : {
        type: Boolean,
        required: true
    },
    playersTurn : {
        type: String,
        required: false
    },
    // Hamza Rafi
    gameRound : {
        type: String,
        default: 'start'
    },
    smallBlind: {
        type: Number,
        default: 25
    },
    bigBlind: {
        type: Number,
        default: 50
    },
    paud:{
        type: Number,
        default: 75
    },
    lastRaise: {
        type: Number,
        default: 50
    }
})

// const pokerRoomSchema = new mongoose.Schema({
//     roomId : {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     players: {
//         type: [String],
//         required: true,
//     },
//     buyIn : {
//         type: Number,
//         required: true
//     },
//     maxPlayers : {
//         type: Number,
//         required: true,
//     },
//     full : {
//         type: Boolean,
//         required: true,
//     },
//     playersData : {
//         type : [playerSchema],
//         default : [],
//     },
//     gameStarted : {
//         type: Boolean,
//         required: true
//     },
//     playersTurn : {
//         type: String,
//         required: false
//     },
//     paud : {
//         type: Number,
//     },
//     smallBlind : {
//         type: Number,
//         default: 25
//     },
//     bigBlind : {
//         type: Number,
//         default: 50
//     },
//     playRound : {
//         type: String,
//         default: "preflop"
//     },
//     howMuchToRaise : {
//         type: Number
//     }
// })


const PokerRoom = mongoose.model('pokerRoom', pokerRoomSchema);

export default PokerRoom