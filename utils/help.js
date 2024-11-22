import mongoose from "mongoose";
import Club from "../models/Club.js";
import User from "../models/Users.js";
import { playerFolded } from "./playerMoves/fold.js";
import startTheGame from "./startTheGame.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")
const clubCollection = db.collection("clubs")

export const sendMessage = async (roomId, message, io) => {
    try {
        let room = await pokerRoomCollection.findOne({ roomId: roomId })
        if (room.chatAvailibility) {
            room.chat.push(message)
            const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
                { roomId: roomId }, // Filter
                { $set: room }, // Update
                { returnDocument: 'after', runValidators: true } // Options
              );
            io.to(roomId).emit('updatePlayers', myNewRoom);
        }
    } catch (err)  {
        console.log(err)
    }
}


export const getPlayerSet  = ( room ) => {
    const table =  
        room.maxPlayers == 2 ? [2, 6] :
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

const deleteRoom = async (room) => {
    try {
        if (room.parameters)
        {
            const club = await clubCollection.findOne({ _id: room.parameters.clubId})
            const newGames = club.games.filter((item) => item !== room.roomId)
            await Club.findByIdAndUpdate(club._id, {
                $set : {games: newGames}
            },  {new: true, runValidators: true})
        }
        await pokerRoomCollection.deleteOne({roomId: room.roomId})
    } catch (err) {
        console.log(err)
    }
} 

export const getRoomInfos = async (roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({ roomId: roomId })
        io.to(roomId).emit('updatePlayers', room);
        if (room.playersData.length == 0 || (room.playersData.length == 1 && room.robot == true))
            await deleteRoom(room)
    } catch (err) {
        console.log(err)
    }
}

export const kickUser = async (userId, roomId, io) => {
    try {
		const room = await pokerRoomCollection.findOne({ roomId: roomId })
		if (!room)
            return 
        let index = room.playersData.findIndex((item) => item.userId == userId)
        room.playersData[index].kicked = true
        if (room.playersTurn !== userId)
        {
            room.playersData[index].inTheGame = false
            room.playersData[index].bet = 0
            const playerInGame = room.playersData.filter((item) => item.inTheGame == true)
            if (playerInGame.length == 1)
            {
                let i = room.playersData.findIndex(player => player.userId === playerInGame[0].userId);
                room.playersData[i].userShips = room.playersData[i].userShips + room.paud
                await pokerRoomCollection.findOneAndUpdate(
                    { roomId: roomId }, // Filter
                    { $set: room }, // Update
                    { returnDocument: 'after', runValidators: true } // Options
                );
                await startTheGame(roomId, io)
                return
            }
        }
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
			{ roomId: roomId }, // Filter
			{ $set: room }, // Update
			{ returnDocument: 'after', runValidators: true } // Options
		);
        if (room.playersTurn == userId)
            await playerFolded(userId, roomId, io)
        else
            io.to(roomId).emit('updatePlayers', myNewRoom);
        return
	} catch (err) {
		console.log(err)
	}
}

