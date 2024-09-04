import mongoose from "mongoose";
import { getBestHandPlayers } from "../getWinners.js";
import startTheGame from "../startTheGame.js";
import { nextPlayer } from "../startTheGame.js";
import { nextStage } from "./check.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

export const getWinner = async (room, roomId, io) => {
    try {
        room.gameRound = "river"
        room.playersTurn = null
        const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
        room.winner = {
            userId: win.winningPlayers[0],
            cardsCumminity: win.winningCommunityCards,
            typeWin: win.winningCombination
        }
        console.log("cards winning ===> ", win.winningCommunityCards)
        let i = 0
        while (i < win.winningPlayers.length)
        {
            let myIndex = room.playersData.findIndex(player => player.userId === win.winningPlayers[i]);
            room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.winningPlayers.length)
            i++
        }
        await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
        io.to(roomId).emit('updatePlayers');
        setTimeout(async () => {
            await startTheGame(roomId, io)
        }, 5000)
        return
    } catch (err) {
        return room
    }
    
}


export const allIn = async (userId, roomId, io) => {
	try {
		let room = await pokerRoomCollection.findOne({ roomId: roomId });
		if (!room || userId !== room.playersTurn)
		  return
		let index = room.playersData.findIndex(player => player.userId === userId);
		room.paud = room.paud + room.playersData[index].userShips
        room.playersData[index].userShips = 0
        room.playersData[index].bet = room.playersData[index].bet + room.playersData[index].userShips
        if (room.lastRaise < room.playersData[index].bet)
            room.lastRaise = room.playersData[index].bet
        else {
            const otherPlayers = room.playersData.filter((item) => item.userId !== userId)
            const finishedPlayers = otherPlayers.filter((item) => item.userShips > 0 && item.inTheGame )
            const allbet = otherPlayers.filter((item) => item.bet !== room.lastRaise)
            if (finishedPlayers.length == 0) {
                await getWinner(room, roomId, io)
                return
            } else if (allbet.length == 0) {
                const data = await nextStage(room, roomId, io)
                if (data.return == false)
                    return
                else 
                    room = data.room
            }

        }
        room.playersTurn = nextPlayer(room)
        await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
        return
	} catch (err) {
		console.log(err)
	}
}