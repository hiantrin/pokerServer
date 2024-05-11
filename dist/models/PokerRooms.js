"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const pokerRoomSchema = new mongoose_1.default.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    players: {
        type: [String],
        required: true,
    },
    buyIn: {
        type: Number,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true,
    },
    full: {
        type: Boolean,
        required: true,
    }
});
const PokerRoom = mongoose_1.default.model('pokerRoom', pokerRoomSchema);
exports.default = PokerRoom;
