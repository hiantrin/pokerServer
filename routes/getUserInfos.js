import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import User from "../models/Users.js"


const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');

router.get('/getUserInfos', checkToken, async (req, res) => {
    await collection.findOne({ _id: req.userId}).then((response) => {
        if (!response)
            res.status(400).send("didn't find the user")
        else {
            res.status(200).send(response)
        }
    }).catch((err) => {
        res.status(500).send("Internal server Error")
    })
})

router.patch("/updateUserInfos", checkToken, async (req, res) => {
    const {username, email, fullName, avatar64} = req.body
    await User.findByIdAndUpdate(req.userId, { 
        $set: {username, email, fullName, avatar64}
    }, { new: true, runValidators: true}).then((response) => {
        if (!response)
            res.status(400).send("didn't find the user")
        else {
            res.status(200).send(response)
        }
    }).catch((err) => {
        res.status(500).send("Internal server Error")
    })
})

router.get("/getAllUsers", async (req, res) => {
    try {
        const users = await User.find({})
        if(!users)
            res.status(200).send([])
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send("Internal server Error")
    }
})

router.post("/changeGoldShips", async (req, res ) => {
    const {userId, type, amount} = req.body
    try {
        const user = await collection.findOne({_id : userId})
        if (!user) {
            return res.status(405).send('User not found');
        }
        if (type == "gold")
        {
            const newUser = await User.findByIdAndUpdate(userId, {
                $set : {gold: amount}
            }, {new: true, runValidators: true})
            return res.status(200).send(newUser)

        } else if (type == "ships") {
            const newUser = await User.findByIdAndUpdate(userId, {
                $set : {ships: amount}
            }, {new: true, runValidators: true})
            return res.status(200).send(newUser)
        }

    } catch (err) {
        res.status(500).send('Internal server error');
    }
})

export default router