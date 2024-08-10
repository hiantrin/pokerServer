import mongoose from "mongoose";


const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

async function checkToStartGame(roomId) {
    try {
        const room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (room && room.players.length >= 2 && !room.gameStarted) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking players in room:', error);
        return false
    }
}

export default checkToStartGame;