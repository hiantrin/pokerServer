import mongoose from "mongoose";
import { checkIfAllOut } from "../startTheGame";
import { nextPlayer } from "../startTheGame";
import { getWinner } from "./allIn";
import { nextStage } from "./check";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const callLastRaise = async (userId, roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({ roomId: roomId });
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
        await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
        return
    } catch (err) {
      console.log(err)
    }
  }