import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import User from "../models/Users.js"

const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');

const getShipsNumber = (gold) => {
    if (gold == 1)
        return 1000
    if (gold == 20)
        return 30000
    if (gold == 60)
        return 100000
    if (gold == 180)
        return 300000
    if (gold == 300)
        return 500000
    if (gold == 600)
        return 1200000
}

router.patch("/buyShips", checkToken, async (req, res) => {
    await collection.findOne({_id: req.userId}).then(async (response) => {
        if (response.gold >= req.body.gold)
        {
            const ships = getShipsNumber(req.body.gold)
            await User.findByIdAndUpdate(req.userId, { 
                $set: {gold : response.gold - req.body.gold, ships : ships + response.ships}
            }, { new: true, runValidators: true})
            .then((response) => {
                if (!response)
                    res.status(400).send("didn't find the user")
                else {
                    res.status(200).send(response)
                }
            }).catch((err) => {
                console.log(err)
                res.status(500).send("Internal server Error")
            })
        }
        else {
            res.status(400).send("not enough money")
        }
    }).catch((err) => {
        console.log(err)
        res.status(500).send("Internal server Error")
    })
})


router.get("/bonus", checkToken, async (req, res) => {
    await collection.findOne({_id: req.userId}).then(async (response) => {
        if (response.firstLogin == true)
        {
            await User.findByIdAndUpdate(req.userId, { 
                $set: {firstLogin : false, ships : 1000 + response.ships}
            }, { new: true, runValidators: true})
            .then((response) => {
                if (!response)
                    res.status(400).send("didn't find the user")
                else {
                    res.status(200).send(response)
                }
            }).catch((err) => {
                console.log(err)
                res.status(500).send("Internal server Error")
            })
        }
        else
            res.status(300).send("not first time")
    }).catch((err) => {
        console.log(err)
        res.status(500).send("Internal server Error")
    })
})

export default router