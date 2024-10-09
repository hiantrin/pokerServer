import mongoose from "mongoose";
import startTheGame, { checkWhoIsNext } from "../startTheGame.js";
import { nextPlayer } from "../startTheGame.js";
import { nextStage } from "./check.js";
import { getWinner } from "./allIn.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

const launchTwoParty = async (room, roomId, io, userId) => {
    try {
        let i = room.playersData.findIndex(player => player.userId === userId);
        room.playersData[i].inTheGame = false
        room.playersData[i].bet = 0
        let index = room.playersData.findIndex(player => player.userId !== userId);
        room.playersData[index].userShips = room.playersData[index].userShips + room.paud
        room.playersTurn = null
        room.winner = {
            userId : room.playersData[index].userId,
            typeWin : "fold",
            cardsCumminity: null
        }
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
            $set : {playersData: room.playersData, playersTurn: room.playersTurn, winner: room.winner}
        }, { returnDocument: 'after', runValidators: true }  )
        io.to(roomId).emit('updatePlayers', myNewRoom);
        setTimeout(async () => {
            await startTheGame(roomId, io)
        }, 5000)
    } catch (err) {
        return room
    }
    
}

export const playerFolded = async (userId, roomId, io) => {
    try {
        let room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (!room || userId !== room.playersTurn)
            return
    
        if (room.players.length == 2) {
            await launchTwoParty(room, roomId, io, userId)
            return
        }
        else {
            let i = room.playersData.findIndex(player => player.userId === userId);
            room.playersData[i].inTheGame = false
            room.playersData[i].bet = 0
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
            if (playerInGame.length !== 1)
                room.playersTurn = nextPlayer(room)
            else
                room.playersTurn = null
            const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
                { roomId: roomId }, // Filter
                { $set: room }, // Update
                { returnDocument: 'after', runValidators: true } // Options
            );
            checkWhoIsNext(myNewRoom, io)
            io.to(roomId).emit('updatePlayers', myNewRoom);
            if (playerInGame.length == 1)
            {
                setTimeout(async () => {
                    await startTheGame(roomId, io)
                }, 5000)
                return
            }
        }
    } catch (err) {
      console.log(err)
    }
  }