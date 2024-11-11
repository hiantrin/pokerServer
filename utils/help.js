import mongoose from "mongoose";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

export const sendMessage = async (roomId, message, io) => {
    try {
        let room = await pokerRoomCollection.findOne({ roomId: roomId })
        room.chat.push(message)
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId }, // Filter
            { $set: room }, // Update
            { returnDocument: 'after', runValidators: true } // Options
          );
        io.to(roomId).emit('updatePlayers', myNewRoom);
    } catch (err)  {
        console.log(err)
    }
}
