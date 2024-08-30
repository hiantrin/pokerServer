import mongoose from "mongoose";
import { playerFolded } from "../playerMoves/fold.js";

const robotPlays = async (room, index, io) => {
    setTimeout(async () => {
        await playerFolded(room.playersTurn, room.roomId, io)
    }, 5000)
    return
}

export default robotPlays