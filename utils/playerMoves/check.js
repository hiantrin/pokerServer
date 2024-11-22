import { getBestHandPlayers } from "../getWinners.js";
import startTheGame, { checkWhoIsNext } from "../startTheGame.js";
import { nextPlayer } from "../startTheGame.js";
import mongoose from "mongoose";
import { saveAndMove } from "./call.js";
import { sendTaxToAdmin } from "./allIn.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

export const nextStage = async (room, roomId, io) => {
    const data ={
        room: room,
        return: true
    }
    try {
        if (data.room.gameRound == "preflop")
            data.room.gameRound = "flop"
        else if (data.room.gameRound == "flop")
            data.room.gameRound = "turn"
        else if (data.room.gameRound == "turn")
            data.room.gameRound = "river"
        else if (data.room.gameRound == "river")
        {
            room.playersTurn = null
            await saveAndMove(roomId, room, io)
            setTimeout(async () => {
                room.playersTurn = null
                room.lastPlayerMove = null
                const win  = getBestHandPlayers(data.room.playersData.filter((item) => item.inTheGame), data.room.communityCards)
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
    } catch (err) {
        return data
    }
    
}

export const checkMove = async (userId, roomId, io) => {
    try {
        let room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (!room || userId !== room.playersTurn)
            return
        let index = room.playersData.findIndex(player => player.userId === userId);
        room.playersData[index].checked = true
        const playersDontChecked = room.playersData.filter((item) => item.inTheGame && item.userShips !== 0 && item.checked == false)
        room.lastPlayerMove = {
            userId : userId,
            playerMove : "Check"
        }
        if (playersDontChecked.length == 0)
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