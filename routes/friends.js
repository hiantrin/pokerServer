import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import User from "../models/Users.js";



const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');

const createRequest = (user) => {
    const theRequest = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        avatar64: user.avatar64,
        requestType: "Friend"
    }
    return theRequest
}

router.post("/sendFriendRequest", checkToken, async (req, res) => {
    const { username } = req.body

    try {
        const user = await collection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const theCatcher = await collection.findOne({ username: username})
        if (!theCatcher) {
            return res.status(405).send('User not found');
        }
        const theRequest = createRequest(user)
        theCatcher.requests.push(theRequest)
        const newUser  = await User.findByIdAndUpdate(theCatcher._id, {
            $set : {requests: [theRequest]}} , {new: true, runValidators: true})
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