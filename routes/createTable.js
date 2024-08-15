import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import { v4 as uuidv4 } from 'uuid';
import PokerRoom from "../models/PokerRooms.js";
import User from "../models/Users.js";
import Club from "../models/Club.js";
import { nextPlayer } from "../utils/startTheGame.js";

const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');
const pokerRoomCollection = db.collection("pokerrooms")
const clubCollection = db.collection("clubs")

const createNode = (user, ships) => {
    const node = {
        userId : user._id,
        username: user.username,
        currentCards: null,
        currentTextEmoji : "",
        userShips: ships,
        avatar: user.avatar,
        avatar64: user.avatar64,
        inTheGame: false
    }
    return node
}

const createTable = async (value, userId, persons, user, ships) => {
    try {
        const roomId = uuidv4()
        const players = [userId]
        const room = new PokerRoom({
            roomId,
            maxPlayers : persons,
            buyIn : ships,
            players,
            full: false,
            playersData: [createNode(user, ships)],
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
        const oldUser = await collection.findOne({ _id: req.userId });
        if (!oldUser)
            return res.status(400).send("user not found")
        const room = await pokerRoomCollection.findOne({roomId: req.body.roomId})
        if (!room)
            return res.status(400).send("didn't find room")
        const thePlayer = room.playersData.filter((item) => item.userId == req.userId)
        if (thePlayer.length == 0)
        {   
            const waiting = room.waitingRoom.filter((item) => item.userId == req.userId)
            const user = await User.findByIdAndUpdate(req.userId, {
                $set: {roomId: null}
            }, { new: true, runValidators: true})
            if (waiting.length !== 0)
            {
                await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
                    $set : {waitingRoom: room.waitingRoom.filter((item) => item.userId !== req.userId)}
                }, {new: true, runValidators: true})
            }
            return res.status(200).send(user)
        }
        const user = await User.findByIdAndUpdate(req.userId, {
            $set: {roomId: null, ships: oldUser.ships + thePlayer[0].userShips}
        }, { new: true, runValidators: true})
        room.playersData = room.playersData.filter((item) => item.userId != req.userId)
        room.players = room.players.filter(item => item != req.userId)
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
        }
        else {
            if (room.playersTurn == req.userId)
                room.playersTurn = nextPlayer(room)
        }
        await pokerRoomCollection.updateOne({ roomId: req.body.roomId }, { $set : room });
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
        else if (!room.players.includes(req.userId) && !room.gameStarted)
            room.players.push(req.userId)
        const oldUser = await collection.findOne({ _id: req.userId });
        if (!oldUser)
            return res.status(400).send("didn't find user")
            const user = await User.findByIdAndUpdate(req.userId, {
                $set : {roomId: room.roomId, ships: oldUser.ships - room.buyIn}
            }, {new: true, runValidators: true})
            if (!user)
                return res.status(400).send("didn't find the user")
        if (!room.gameStarted)
        {
            if (room.playersData.filter(item => item.userId == req.userId))
                room.playersData.push(createNode(user, room.buyIn))
            const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
                $set : {players : room.players, playersData: room.playersData, full: room.players.length == room.players.maxPlayers ? true : false}
            }, {new: true, runValidators: true})
            if (!newRoom)
                return res.status(400).send("sorry can't join room right now")
        }
        else {
            if (room.waitingRoom.filter(item => item.userId == req.userId))
                room.waitingRoom.push(createNode(user, room.buyIn))
            const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
                $set : {waitingRoom: room.waitingRoom}
            }, {new: true, runValidators: true})
            if (!newRoom)
                return res.status(400).send("sorry can't join room right now")
        }
        
        res.status(200).send(user)
    } catch (err) {
        console.log(err)
        res.status(400).send("Internal server error")
    }
})

router.get("/spectate", checkToken, async (req, res) => {
    try {
        const room = await pokerRoomCollection.findOne({roomId: req.query.roomId})
        if (!room)
            return res.status(400).send("didn't find room")
        const userRoom = await User.findByIdAndUpdate(req.userId, { 
            $set: { roomId: req.query.roomId }}, {new: true, runValidators: true});
        if (!userRoom) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(userRoom);
    } catch (err) {
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
    const { value , persons , clubId} = req.body

    if (!persons || value < 0  || value > 8 || (persons != 4 && persons != 6))
        return res.status(405).send("check your Informations")

    try {
        const user = await collection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }

        const roomId = await createTable(value, req.userId, persons, user, 1000);
        if (!roomId) {
            return res.status(500).send('Error creating room');
        }
        if (clubId)
        {
            const club = await clubCollection.findOne({ _id: clubId})
            club.games.push(roomId)
            await Club.findByIdAndUpdate(club._id, {
                $set : {games: club.games}
            },  {new: true, runValidators: true})
        }
        const userRoom = await User.findByIdAndUpdate(req.userId, { 
            $set: { roomId: roomId, ships: user.ships - 1000 } }, {new: true, runValidators: true} );
        if (!userRoom) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(userRoom);
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

////// Admin
router.get("/getAllRooms", async (req, res) => {
    try {
        const rooms = await PokerRoom.find({})
        if (!rooms)
            res.status(200).send([])
        res.status(200).send(rooms)
    } catch (err) {
        console.log(err)
        res.status(500).sed("Internal server error")
    }
})

const checkCommunityCards = (cards) => {
    const seen = new Set();
    const duplicates = [];

    cards.forEach(item => {
        // Convert the object to a string for comparison
        const key = JSON.stringify(item);

        if (seen.has(key)) {
            duplicates.push(item);
        } else {
            seen.add(key);
        }
    });
    if (duplicates.length > 0)
        return false
    return true
}

const checkplayersCards = (cards, playersData) => {
    const playersCards = []
    let i = 0

    while (i < playersData.length)
    {
        let count = 0
        while (count < playersData[i].currentCards.length)
        {
            playersCards.push(playersData[i].currentCards[count])
            count++
        }
        i++
    }
    const allCards = cards.concat(playersCards)
    if (!checkCommunityCards(allCards))
        return false
    return true
}

router.patch("/changeCards", async (req, res) => {
    const { roomId, cards } = req.body
    try {
        const room = await pokerRoomCollection.findOne({roomId: roomId})
        if (!room)
            return res.status(400).send("didn't find room")
        if (!room.gameStarted)
            return res.status(400).send("game not started")
       
        if (!checkCommunityCards(cards))
            return res.status(400).send("some cards in communityCards are the same")
        if (!checkplayersCards(cards, room.playersData))
            return res.status(400).send("some cards in communityCards  are the same as the players")
        await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
            $set : {communityCards: cards}
        }, {new: true, runValidators: true})
        res.status(200).send("success")
    } catch (err) {
        console.log(err)
        res.status(500).send("Internal server error")
    }

})

export default router