import mongoose from "mongoose";
import User from "../models/Users.js";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")
const userCollection = db.collection('users');

export const addMoney = async (user, room, playerIndex, io) => {
    try {
        console.log("am here")
        await User.findByIdAndUpdate(user._id, {
            $set : {ships: user.ships - room.buyIn}
        }, {new: true, runValidators: true})
        room.playersData[playerIndex].userShips = room.playersData[playerIndex].userShips + room.buyIn
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
            { roomId: room.roomId }, // Filter
            { $set: room }, // Update
            { returnDocument: 'after', runValidators: true } // Options
        );
        io.to(room.roomId).emit('updatePlayers', myNewRoom);
    } catch (err) {
        console.log(err)
    }
}

export const launchReBuy = async (userId, roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({roomId: roomId})
        if (!room)
            return
        let playerIndex = room.playersData.findIndex((item) => item.userId == userId)
        if (playerIndex < 0)
            return
        const user = await userCollection.findOne({_id: userId})
        if (!user || user.ships < room.buyIn || (room.playersData[playerIndex].userShips > (room.buyIn / 2)))
            return
        if (room.playersData[playerIndex].userId == room.parameters.admin)
            await addMoney(user, room, playerIndex, io)        
        else
            io.to(roomId).emit("askRebuy", {userId: userId, username: user.username})
    } catch (err) {
        console.log(err)
    }
}

export const adminAcceptRebuy = async (userId, roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({roomId: roomId})
        if (!room)
            return
        let playerIndex = room.playersData.findIndex((item) => item.userId == userId)
        if (playerIndex < 0)
            return
        const user = await userCollection.findOne({_id: userId})
        if (!user)
            return
        await addMoney(user, room, playerIndex, io)
    } catch (err) {
        console.log(err)
    }
}

export const showCards = async (userId, roomId, number, io) => {
    try {
        const room = await pokerRoomCollection.findOne({roomId: roomId})
        if (!room)
            return
        let playerIndex = room.playersData.findIndex((item) => item.userId == userId)
        if (playerIndex < 0)
            return
        const user = await userCollection.findOne({_id: userId})
        if (!user)
            return
        room.playersData[playerIndex].showCards  = number
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
			{ roomId: roomId }, // Filter
			{ $set: room }, // Update
			{ returnDocument: 'after', runValidators: true } // Options
		);
        io.to(room.roomId).emit('updatePlayers', myNewRoom);
    } catch (err) {
        console.log(err)
    }
}


export const sendGift = async (type, userId, name, roomId, io) => {
    try {
        const room = await pokerRoomCollection.findOne({roomId: roomId})
        if (!room)
            return
        if (type == "all")
        {
            let i = 0
            while (i < room.playersData.length)
            {
                room.playersData[i].gift = name
                i++
            }
        }
        else {
            let playerIndex = room.playersData.findIndex((item) => item.userId == userId)
            if (playerIndex < 0)
                return
            room.playersData[playerIndex].gift = name
        }
        const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
			{ roomId: roomId }, // Filter
			{ $set: room }, // Update
			{ returnDocument: 'after', runValidators: true } // Options
		);
        io.to(room.roomId).emit('updatePlayers', myNewRoom);
    } catch (err) {
        console.log(err)
    }
}