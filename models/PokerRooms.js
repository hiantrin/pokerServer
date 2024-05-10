import mongoose from "mongoose";


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
    }
})

const PokerRoom = mongoose.model('pokerRoom', pokerRoomSchema);

export default PokerRoom