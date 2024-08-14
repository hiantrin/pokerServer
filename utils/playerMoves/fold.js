import mongoose from "mongoose";
import startTheGame from "../startTheGame";
import { getBestHandPlayers } from "../getWinners";
import { nextPlayer } from "../startTheGame";
import { nextStage } from "./check";
import { getWinner } from "./allIn";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

const launchTwoParty = async (room, roomId, io) => {
    let index = room.playersData.findIndex(player => player.userId !== userId);
    room.playersData[index].userShips = room.playersData[index].userShips + room.paud
    await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
        $set : {playersData: room.playersData}
    }, {new: true, runValidators: true} )
    await startTheGame(roomId, io)
}

export const playerFolded = async (userId, roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (!room || userId !== room.playersTurn)
            return
    
        if (room.players.length == 2) {
            await launchTwoParty(room, roomId, io)
            return
        }
        else {
            let i = room.playersData.findIndex(player => player.userId === userId);
            room.playersData[i].inTheGame = false
            const playerInGame = room.playersData.filter((item) => item.inTheGame == true)
            if (playerInGame.length == 1)
            {
                let index = room.playersData.findIndex(player => player.userId === playerInGame[0].userId);
                room.playersData[index].userShips = room.playersData[index].userShips + room.paud
            }
            else {
                const playerChecked = room.playersData.filter((item) => item.inTheGame && !item.checked)
                const playerCalled = room.playersData.filter((item) => item.inTheGame && item.bet !== room.lastRaise && item.userShips !== 0)
                const plyerOut = room.playersData.filter((item) => item.inTheGame && item.userShips > 0)
                if ( (room.gameRound !== "preflop" && room.lastRaise == 0 && playerChecked.length == 0) || playerCalled.length == 0)
                {
                    const data = await nextStage(room, roomId, io)
                    if (data.return == false)
                        return
                    else 
                        room = data.room
                } else if (plyerOut.length < 2) {
                    await getWinner(room, roomId, io)
                    return
                }
            }
            room.playersTurn = nextPlayer(room)
            await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
            io.to(roomId).emit('updatePlayers');
            if (playerInGame.length == 1)
            {
                await startTheGame(roomId, io)
                return
            }
        }
    } catch (err) {
      console.log(err)
    }
  }