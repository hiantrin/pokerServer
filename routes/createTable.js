import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import { v4 as uuidv4 } from 'uuid';
import PokerRoom from "../models/PokerRooms.js";
import User from "../models/Users.js";

const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');
const pokerRoomCollection = db.collection("pokerrooms")

const createNode = (user) => {
    const node = {
        userId : user._id,
        currentCards: null,
        currentTextEmoji : "",
        userShips: user.ships,
        avatar: user.avatar,
        avatar64: user.avatar64
    }
    return node
}

const createTable = async (value, userId, persons, user) => {
    try {
        const roomId = uuidv4()
        const players = [userId]
        const room = new PokerRoom({
            roomId,
            maxPlayers : persons,
            buyIn : 200000,
            players,
            full: false,
            playersData: [createNode(user)],
            gameStarted: false,
        })
        const response = await room.save()
        return response.roomId
    } catch (err) {
        console.log(err)
        return null
    }
}

router.patch("/quitTable", checkToken, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.userId, {
            $set: {roomId: null}
        }, { new: true, runValidators: true})
        if (!user)
            return res.status(400).send("user not found")
        const room = await pokerRoomCollection.findOne({roomId: req.body.roomId})
        if (!room)
            return res.status(400).send("didn't find room")
        const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
            $set : {players : room.players.filter(item => item != req.userId ), full: false, playersData: room.playersData.filter(item => item.userId != req.userId)}
        }, {new: true, runValidators: true} )
        if (!newRoom)
            return res.status(400).send("room not found")
        res.status(200).send(user)
    } catch (err) {
        res.status(400).send("Internal server Error")
    }
})

router.get("/getPlayersInfos", checkToken, async (req, res) => {
    try {
        const room = await PokerRoom.find({roomId: req.query.roomId})
        if (!room)
            return res.status(400).send("there is an error in the room")
        res.status(200).send(room[0])
    } catch (err) {
        console.log(err)
        res.status(400).send("Internal server Error")
    }
})

router.get("/joinRoom", checkToken, async (req, res) => {

    try {
        const room = await pokerRoomCollection.findOne({roomId: req.query.roomId})
        if (!room)
            return res.status(400).send("didn't find room")
        else if (room.full)
            return res.status(300).send("room is full")
        else if (!room.players.includes(req.userId))
            room.players.push(req.userId)
        const user = await User.findByIdAndUpdate(req.userId, {
            $set : {roomId: room.roomId}
        }, {new: true, runValidators: true})
        if (!user)
            return res.status(400).send("didn't find the user")
        if (room.playersData.filter(item => item.userId == req.userId))
            room.playersData.push(createNode(user))
        const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
            $set : {players : room.players, playersData: room.playersData, full: room.players.length == room.players.maxPlayers ? true : false}
        }, {new: true, runValidators: true})
        if (!newRoom)
            return res.status(400).send("sorry can't join room right now")
        res.status(200).send(user)
    } catch (err) {
        console.log(err)
        res.status(400).send("Internal server error")
    }
})



router.get("/getTableInfos", checkToken, async (req, res) => {
    await pokerRoomCollection.findOne({roomId: req.query.roomId}).then((response) => {
        res.status(200).send(response)
    }).catch((err) => {
        res.status(400).send("didn't find the room")
    })

})

router.post("/createTable", checkToken, async (req, res) => {
    const { value , persons } = req.body

    if (!persons || value < 0  || value > 8 || (persons != 4 && persons != 6))
        return res.status(405).send("check your Informations")

    try {
        const user = await collection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }

        const roomId = await createTable(value, req.userId, persons, user);
        if (!roomId) {
            return res.status(500).send('Error creating room');
        }

        const userRoom = await User.findByIdAndUpdate(req.userId, { 
            $set: { roomId: roomId } }, {new: true, runValidators: true} );
        if (!userRoom) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(userRoom);
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

export default router