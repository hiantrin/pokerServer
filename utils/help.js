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


export const getPlayerSet  = ( room ) => {
    if (room.maxPlayers == 2)
        return 6
    const table = 
        room.maxPlayers == 4 ? [ 1, 3, 5, 7] : 
        room.maxPlayers == 6 ? [ 1, 3, 4, 5, 7, 8] : 
        [ 1, 2, 3, 4, 5, 6, 7, 8]

    let i = 0;
    while (i < table.length) {
        let j = 0
        let index = 0
        while (j < room.playersData.length) {
            if (table[i] == room.playersData[j].set)
                index = 1
            j++;
        }
        if (index == 0)
            return table[i]
        i++;
    }
}

export const getRoomInfos = async (roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({ roomId: roomId })
        io.to(roomId).emit('updatePlayers', room);
    } catch (err) {
        console.log(err)
    }
}