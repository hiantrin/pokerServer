import mongoose from "mongoose";
import { nextPlayer } from "../startTheGame";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const raiseAction = async (userId, amount, roomId) => {
    try {
      const room = await pokerRoomCollection.findOne({ roomId: roomId });
      if (!room || userId !== room.playersTurn)
        return
      let index = room.playersData.findIndex(player => player.userId === userId);
      room.paud = amount +  room.paud
      room.playersData[index].userShips = room.playersData[index].userShips - amount
      if (room.lastRaise == room.playersData[index].bet)
        room.lastRaise = room.lastRaise + amount
      else 
        room.lastRaise = room.playersData[index].bet  + amount
      room.playersData[index].bet = room.playersData[index].bet + amount
      
      room.playersTurn = nextPlayer(room)
      if (room.gameRound !== "preflop")
      {
        room.checking = false
        let counter = 0
        while (counter < room.playersData.length)
        {
          room.playersData[counter].checked = false
          counter++
        }
  
      }
      await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
      return
    } catch (err) {
      console.log(err)
      return
    }
}