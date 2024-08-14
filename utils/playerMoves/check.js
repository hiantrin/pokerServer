import { getBestHandPlayers } from "../getWinners";
import startTheGame from "../startTheGame";
import { nextPlayer } from "../startTheGame";
import { nextPlayer } from "../startTheGame";
import mongoose from "mongoose";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

export const nextStage = async (room, roomId, io) => {
    const data ={
        room: room,
        return: true
    }
    if (data.room.gameRound == "preflop")
        data.room.gameRound = "flop"
    else if (data.room.gameRound == "flop")
        data.room.gameRound = "turn"
    else if (data.room.gameRound == "turn")
        data.room.gameRound = "river"
    else if (data.room.gameRound = "river")
    {
        const win  = getBestHandPlayers(data.room.playersData.filter((item) => item.inTheGame), data.room.communityCards)
        let i = 0
        while (i < win.length)
        {
            let myIndex = data.room.playersData.findIndex(player => player.userId === win[i]);
            data.room.playersData[myIndex].userShips = data.room.playersData[myIndex].userShips + (data.room.paud / win.length)
            i++
        }
        await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : data.room });
        io.to(roomId).emit('updatePlayers');
        setTimeout(async () => {
            await startTheGame(roomId, io)
        }, 2000)
        data.return = false
        return data
    }
    room.lastRaise = 0
    room.checking = true
    let counter = 0
    while (counter < data.room.playersData.length)
    {
        room.playersData[counter].bet = 0
        data.room.playersData[counter].checked = false
        counter++
    }
    return data
}

export const checkMove = async (userId, roomId, io) => {
    try {
      const room = await pokerRoomCollection.findOne({ roomId: roomId });
      if (!room || userId !== room.playersTurn)
        return
      let index = room.playersData.findIndex(player => player.userId === userId);
      room.playersData[index].checked = true
      const playersDontChecked = room.playersData.filter((item) => item.checked == false)
      if (playersDontChecked.length == 0)
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