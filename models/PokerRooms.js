import mongoose from "mongoose";
import playerSchema from "./Player.js";
import { handSchema } from "./Player.js";

const winnerSchema = new mongoose.Schema({
    userId : {
        type: String,
        required: true,
        unique: true,
        default: ''
    },
    cardsCumminity: {
        type: [handSchema],
        default: null
    },
    typeWin : {
        type: String,
        required: true
    }
})

const chatSchema = new mongoose.Schema({
    userId: {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        }
    }
})

const userPlaySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    playerMove : {
        type: String,
        required: true
    }
})

const parametersSchema = new mongoose.Schema({
    gameType: {
        type: String,
        required: true,
    },
    gameLength: {
        type: Number,
        required : true,
    },
    gameAuction: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true,
    },
    playTwice: {
        type: Boolean,
        required: true,
    },
    randomSets: {
        type: Boolean,
        required: true
    },
    clubId : {
        type: String,
        required: true
    },
    admin : {
        type: String,
        required: true
    }
})

const gameTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    cards: {
        type: Number,
        required: true
    }
})

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
    gameRound : {
        type: String,
        default: 'preflop'
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
        default: 0
    },
    lastRaise: {
        type: Number,
        default: 50
    },
    firstTurn : {
        type: Boolean,
        default: true
    },
    communityCards: {
      type: Array,
      default: []
    },
    checking : {
        type: Boolean,
        deafult: false
    },
    waitingRoom : {
        type : [playerSchema],
        default : [],
    },
    robot : {
        type: Boolean,
        required: true
    },
    winner : {
        type: winnerSchema,
        default : null
    },
    parameters : {
        type: parametersSchema,
        default: null
    },
    lastPlayerMove : {
        type: userPlaySchema,
        default : null
    },
    chat : {
        type: [chatSchema],
        default: [],
        required: true
    },
    chatAvailibility: {
        type: Boolean,
        required: true,
        default: true
    },
    gameType : {
        type: gameTypeSchema,
        required: true
    }
})

const PokerRoom = mongoose.model('pokerRoom', pokerRoomSchema);

export default PokerRoom