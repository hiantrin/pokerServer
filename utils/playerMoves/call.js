import mongoose from "mongoose";
import { checkIfAllOut, checkWhoIsNext } from "../startTheGame.js";
import { nextPlayer } from "../startTheGame.js";
import { getWinner } from "./allIn.js";
import { nextStage } from "./check.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const saveAndMove = async (roomId, room, io) => {
    try {
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId }, // Filter
            { $set: room }, // Update
            { returnDocument: 'after', runValidators: true } // Options
          );
        io.to(roomId).emit('updatePlayers', myNewRoom);
        let counterRe = 0
        if (room.gameRound == "preflop")
            counterRe = counterRe + 5000
        else if (room.gameRound == "flop")
            counterRe = counterRe + 2000
        else if (room.gameRound == "turn")
            counterRe = counterRe + 1000
        let counter = 0
        if (room.gameRound == "preflop")
        {
            room.gameRound = "flop"
            const first = await pokerRoomCollection.findOneAndUpdate(
                { roomId: roomId }, // Filter
                { $set: room }, // Update
                { returnDocument: 'after', runValidators: true } // Options
              );
            io.to(roomId).emit('updatePlayers', first);
            counter = counter + 3000
        }
        if (room.gameRound == "flop")
        {
            setTimeout(async () => {
                room.gameRound = "turn"
                const second = await pokerRoomCollection.findOneAndUpdate(
                    { roomId: roomId }, // Filter
                    { $set: room }, // Update
                    { returnDocument: 'after', runValidators: true } // Options
                  );
                io.to(roomId).emit('updatePlayers', second);
            }, counter)
            room.gameRound = "turn"
            counter = counter + 1000
        }
        if (room.gameRound == "turn")
        {
            setTimeout(async () => {
                room.gameRound = "river"
                const third = await pokerRoomCollection.findOneAndUpdate(
                    { roomId: roomId }, // Filter
                    { $set: room }, // Update
                    { returnDocument: 'after', runValidators: true } // Options
                  );
                io.to(roomId).emit('updatePlayers', third);
            }, counter)
        }
        return counterRe
    } catch (err) {
        console.log(err)
        return false
    }
}

export const callLastRaise = async (userId, roomId, io) => {
    try {
        let room = await pokerRoomCollection.findOne({ roomId: roomId });
        if (!room || userId !== room.playersTurn)
            return
        let index = room.playersData.findIndex(player => player.userId === userId);
        room.paud = (room.lastRaise - room.playersData[index].bet) +  room.paud 
        room.playersData[index].userShips = room.playersData[index].userShips - (room.lastRaise - room.playersData[index].bet)
        room.playersData[index].bet = room.lastRaise
        room.lastPlayerMove = {
            userId : userId,
            playerMove : "Call"
        }
        if (checkIfAllOut(userId, room, index))
        {
            room.playersTurn = null
            let counter = await saveAndMove(roomId, room, io)
            setTimeout(async () => {
                await getWinner(room, roomId, io)
            }, 2000 + counter)
            return
        }
        const check = room.playersData.filter((item) => item.bet !== room.lastRaise && item.inTheGame)
        if (check.length == 0)
        {
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