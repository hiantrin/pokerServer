import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import Club from "../models/Club.js";
import { v4 as uuidv4 } from 'uuid';
import User from "../models/Users.js";

const router = express.Router()
const db = mongoose.connection
const userCollection = db.collection('users');

const createClub = async (infos, user) => {
    try {
        const clubId = uuidv4()
        const newClub = new Club({
           _id: clubId,
           clubName: infos.name,
           logo: infos.logo,
           description: infos.description,
           ownerName: user.username,
           ownerId: user._id,
        })
        const response = await newClub.save()
        return response
    } catch (err) {
        console.log(err)
        return null
    }
}

// const addNewClub = (clubs, theClub) => {
//     const pushclub = {
//         _id : theClub
//     }
// }

router.post("/createClub", checkToken, async (req, res) => {
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const club = await createClub(req.body, user)
        if (!club) {
            return res.status(404).send("Error creating club")
        }
        user.clubs.push(club)
        const newUser  = await User.findByIdAndUpdate(req.userId, {
            $set : {clubs: user.clubs}} , {new: true, runValidators: true})
        if (!newUser) {
            return res.status(404).send('error creating club');
        }
        res.status(200).send(newUser);
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }    
})

export default router