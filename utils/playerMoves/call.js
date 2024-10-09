import mongoose from "mongoose";
import { checkIfAllOut, checkWhoIsNext } from "../startTheGame.js";
import { nextPlayer } from "../startTheGame.js";
import { getWinner } from "./allIn.js";
import { nextStage } from "./check.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const callLastRaise = async (userId, roomId, io) => {
    try {
        let room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (!room || userId !== room.playersTurn)
            return
        let index = room.playersData.findIndex(player => player.userId === userId);
        room.paud = (room.lastRaise - room.playersData[index].bet) +  room.paud 
        room.playersData[index].userShips = room.playersData[index].userShips - (room.lastRaise - room.playersData[index].bet)
        room.playersData[index].bet = room.lastRaise
        if (checkIfAllOut(userId, room, index))
        {
            await getWinner(room, roomId, io)
            return
        }
        const check = room.playersData.filter((item) => item.bet !== room.lastRaise && item.inTheGame)
        if (check.length == 0)
        {
            const data = await nextStage(room, roomId, io)
            if (data.return == false)
                return
            else 
                room = data.room
        }
        room.playersTurn = nextPlayer(room)
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId }, // Filter
            { $set: room }, // Update
            { returnDocument: 'after', runValidators: true } // Options
          );
        checkWhoIsNext(myNewRoom, io)
        io.to(roomId).emit('updatePlayers', myNewRoom);
        return
    } catch (err) {
      console.log(err)
    }
  }