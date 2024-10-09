import mongoose from "mongoose";
import { checkWhoIsNext, nextPlayer } from "../startTheGame.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const raiseAction = async (userId, amount, roomId, io) => {
    try {
      let room = await pokerRoomCollection.findOne({ roomId: roomId });
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
      return
    }
}