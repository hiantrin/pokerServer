import mongoose from "mongoose";
import { getBestHandPlayers } from "../getWinners.js";
import startTheGame, { checkWhoIsNext } from "../startTheGame.js";
import { nextPlayer } from "../startTheGame.js";
import { nextStage } from "./check.js";
import { saveAndMove } from "./call.js";
import { raiseAction } from "./raise.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")
const userCollection = db.collection("users")



export const sendTaxToAdmin = async (room) => {
    try {
        const user = await userCollection.findOne({_id: room.parameters.admin})
        let win = ((room.paud / 100) * room.parameters.tax) + user.ships
        const newUser = await userCollection.findOneAndUpdate(
            {_id: room.parameters.admin},
            { $set :  {ships:  win}},
            { returnDocument: 'after', runValidators: true } 
        )
    } catch (err) {
        console.log(err)
    }
}

export const getWinner = async (room, roomId, io) => {
    try {
        room.playersTurn = null
        room.lastPlayerMove = null
        const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
        room.winner = {
            userId: win.winningPlayers[0],
            cardsCumminity: win.winningCommunityCards,
            typeWin: win.winningCombination
        }
        let i = 0
        while (i < win.winningPlayers.length)
        {
            let myIndex = room.playersData.findIndex(player => player.userId === win.winningPlayers[i]);
            if (room.parameters)
            {
                room.paud = room.paud - ((room.paud / 100 ) * room.parameters.tax)
                sendTaxToAdmin(room)
                let winnings = ((room.paud / 100) * room.parameters.tax)
                room.parameters.adminWinnings = room.parameters.adminWinnings + winnings
            }
            room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.winningPlayers.length)
            i++
        }
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId }, // Filter
            { $set: room }, // Update
            { returnDocument: 'after', runValidators: true } // Options
          );
        io.to(roomId).emit('updatePlayers', myNewRoom);
        setTimeout(async () => {
            await startTheGame(roomId, io)
        }, 3000)
        return
    } catch (err) {
        return room
    }
    
}


const secondCards = async (room, io, counter) => {
    try {
        const players = room.playersData.filter((item) => item.inTheGame)
        if (room.parameters && room.parameters.playTwice && players.length == 2)
        {
            setTimeout(async () => {
                room.gameRound = "finish"
                const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
                    { roomId: room.roomId }, // Filter
                    { $set: room }, // Update
                    { returnDocument: 'after', runValidators: true } // Options
                );
                io.to(room.roomId).emit('updatePlayers', myNewRoom);
            }, counter)
            return 5000
        }
    else 
        return 0
    } catch (err) {
        console.log(err)
    }
}

export const allIn = async (userId, roomId, io) => {
	try {
		let room = await pokerRoomCollection.findOne({ roomId: roomId });
		if (!room || userId !== room.playersTurn)
		  return
		let index = room.playersData.findIndex(player => player.userId === userId);
        if (room.lastRaise < room.playersData[index].userShips) {
            await raiseAction(userId, room.playersData[index].userShips, roomId, io, "All in")
            return
        }
		room.paud = room.paud + room.playersData[index].userShips
        room.playersData[index].userShips = 0
        room.playersData[index].bet = room.playersData[index].bet + room.playersData[index].userShips
        room.lastPlayerMove = {
            userId : userId,
            playerMove : "All in"
        }
        const otherPlayers = room.playersData.filter((item) => item.userId !== userId)
        const finishedPlayers = otherPlayers.filter((item) => item.userShips > 0 && item.inTheGame )
        const allbet = otherPlayers.filter((item) => item.bet !== room.lastRaise)
        if (finishedPlayers.length == 0) {
            room.playersTurn = null
            let counter  = await saveAndMove(roomId, room, io)
            let secondCounter = await secondCards(room, io, counter)
            setTimeout(async () => {
                await getWinner(room, roomId, io)
            }, 2000 + counter + secondCounter)
            return
        } else if (allbet.length == 0) {
            const data = await nextStage(room, roomId, io)
            if (data.return == false)
                return
            else {
                room = data.room
                setTimeout(async () => {
                    room.playersTurn = nextPlayer(room)
                    const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
                        { roomId: roomId }, // Filter
                        { $set: room }, // Update
                        { returnDocument: 'after', runValidators: true } // Options
                    );
                    checkWhoIsNext(myNewRoom, io)
                    io.to(roomId).emit('updatePlayers', myNewRoom);
                }, data.counter)
                return
            }
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