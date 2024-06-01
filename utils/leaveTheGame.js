import mongoose from "mongoose";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

const leaveTheGame = async (roomId) => {
    try {
        await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {gameStarted: false}
          }, { returnDocument: 'after', runValidators: true })
    } catch {
        console.error('Error starting the game:', error);
    }
    
}

export default leaveTheGame