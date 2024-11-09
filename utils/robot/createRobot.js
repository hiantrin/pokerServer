import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";
import { checkWhoIsNext, nextPlayer } from '../startTheGame.js';

const db = mongoose.connection
const pokerRoomCollection = db.collection("pokerrooms")


const createRobotInfos = (userShips) => {
    const robotId = uuidv4()
    const node = {
        userId : robotId,
        username: "Robot",
        currentCards: null,
        currentTextEmoji : "",
        userShips: userShips,
        avatar: null,
        avatar64: null,
        inTheGame: false,
        robot : true,
        set : 6
    }
    return node
}

export const quickRobot = async (roomId, robotId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({roomId: roomId})
        if (!room)
            return res.status(400).send("didn't find room")
        const thePlayer = room.playersData.filter((item) => item.userId == robotId)
        // if (thePlayer.length == 0)
        // {   
        //     const waiting = room.waitingRoom.filter((item) => item.userId == req.userId)
        //     const user = await User.findByIdAndUpdate(req.userId, {
        //         $set: {roomId: null}
        //     }, { new: true, runValidators: true})
        //     if (waiting.length !== 0)
        //     {
        //         await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
        //             $set : {waitingRoom: room.waitingRoom.filter((item) => item.userId !== req.userId)}
        //         }, {new: true, runValidators: true})
        //     }
        //     return res.status(200).send(user)
        // }
        room.playersData = room.playersData.filter((item) => item.userId != robotId)
        room.players = room.players.filter(item => item != robotId)
        if (room.players.length == 1)
        {
            room.gameStarted = false
            room.gameRound = "preflop"
            room.lastRaise = 0
            room.communityCards = []
            room.playersData[0].currentCards = []
            room.playersData[0].bet = 0
            room.playersData[0].userShips = room.playersData[0].userShips + room.paud
            room.paud = 0
            room.playersTurn = null
        }
        else {
            if (room.playersTurn == robotId)
                room.playersTurn = nextPlayer(room)
        }
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId }, // Filter
            { $set: room }, // Update
            { returnDocument: 'after', runValidators: true } // Options
          );
        io.to(roomId).emit("updatePlayers", myNewRoom);
        return room
    } catch (err) {
        console.log(err)
        return null
    }
}

const createRobot = async (room, userShips) => {
    try {
        const robotInfos = createRobotInfos(userShips)
        room.players.push(robotInfos.userId)
        if (!room.gameStarted)
        {
            room.playersData.push(robotInfos)
            const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
                $set : {players : room.players, playersData: room.playersData, full: room.players.length == room.players.maxPlayers ? true : false}
            }, {new: true, runValidators: true})
            if (!newRoom)
                return null
        } else {
            room.waitingRoom.push(robotInfos)
            const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
                $set : {waitingRoom: room.waitingRoom}
            }, {new: true, runValidators: true})
            if (!newRoom)
                return null
        }
        return "success"
    } catch (err) {
        console.log(err)
        return null
    }
    

}

export default createRobot