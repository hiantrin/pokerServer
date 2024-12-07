import mongoose from "mongoose";


const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

async function checkToStartGame(roomId) {
    try {
        const room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (room && room.playersData.length >= 2 && !room.gameStarted) {
            if (room.parameters && room.parameters.randomSets == false)
            {
                    return {status: true, counter: true}
            } else
                return {status: true, counter: false}
        } else
            return {status: false, counter: false}
    } catch (error) {
        console.error('Error checking players in room:', error);
        return false
    }
}

export default checkToStartGame;