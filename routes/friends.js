import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import User from "../models/Users.js";



const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');

const createRequest = (user, type, req) => {
    const theRequest = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        avatar64: user.avatar64,
        requestType: type,
        clubName: type == "Club" ? req.body.clubName : "",
        clubId : type == "Club" ? req.body.clubId : ""
    }
    return theRequest
}

router.post("/acceptDeclineFriendShip", checkToken, async (req, res) => {
    const { catcherId, type } = req.body;

    try {
        const user = await collection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        if (type == "Accept")
        {
            const newFriend = user.requests.filter((item) => item._id == catcherId)
            console.log("the new Friend", newFriend)
            user.friends.push(newFriend[0])
            console.log("the new arrat friend ===> ", user.friends)
            const newUser  = await User.findByIdAndUpdate(req.userId, {
                $set : {requests: user.requests.filter((item) => item._id !== catcherId), friends: user.friends}} , {new: true, runValidators: true})
            if (!newUser) {
                return res.status(404).send('error creating club');
            }
            const theFriend = await collection.findOne({ _id: catcherId})
            const theCatcher = createRequest(theFriend, "Friend", "")
            theFriend.friends.push(theCatcher)
            const otherUser  = await User.findByIdAndUpdate(catcherId, {
                $set : {friends: theFriend.friends}} , {new: true, runValidators: true})
            if (!newUser) {
                return res.status(404).send('error creating club');
            }
            
            res.status(200).send(newUser)
        } else {
            const newUser  = await User.findByIdAndUpdate(req.userId, {
                $set : {requests: user.requests.filter((item) => item._id !== catcherId)}} , {new: true, runValidators: true})
            if (!newUser) {
                return res.status(404).send('error creating club');
            }
            res.status(200).send(newUser)
        }
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

router.post("/sendFriendRequest", checkToken, async (req, res) => {
    const { username, type } = req.body

    try {
        const user = await collection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const theCatcher = await collection.findOne({ username: username})
        if (!theCatcher) {
            return res.status(405).send('User not found');
        }
        const theRequest = createRequest(user, type, req)
        theCatcher.requests.push(theRequest)
        const newUser  = await User.findByIdAndUpdate(theCatcher._id, {
            $set : {requests: theCatcher.requests}} , {new: true, runValidators: true})
        if (!newUser) {
            return res.status(404).send('error creating club');
        }
        console.log(newUser)
        res.status(200).send("request been send")
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

export default router