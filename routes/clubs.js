import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";
import Club from "../models/Club.js";
import { v4 as uuidv4 } from 'uuid';
import User from "../models/Users.js";

const router = express.Router()
const db = mongoose.connection
const userCollection = db.collection('users');
const clubCollection = db.collection("clubs")

const createMember = (user) => {
    const member = {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        avatar64: user.avatar64
    }
    return member
}

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
            members: [{
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                avatar64: user.avatar64
           }]
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

router.post("/acceptClubInvite", checkToken, async (req, res) => {
    const {clubId, requestId} = req.body
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        // console.log(clubId, requestId)

        const myClub = await clubCollection.findOne({_id: clubId})
        if (!myClub) {
            return res.status(405).send('Club not found');
        }
        const newMember = createMember(user)
        myClub.members.push(newMember)

        const newClub = await clubCollection.findOneAndUpdate({_id: clubId}, {
            $set : {members: myClub.members}
        }, {new: true, runValidators: true})
        user.clubs.push(newClub)
        const theUser = await userCollection.findOneAndUpdate({_id : req.userId},
            {$set: {requests: user.requests.filter((item) => item._id !== requestId), clubs: user.clubs}},
            {new: true, runValidators: true})
            console.log(theUser)
        res.status(200).send(theUser);
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

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

router.get("/getClubInfos", checkToken, async(req, res) => {
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const myClub = await clubCollection.findOne({_id: req.query.clubId})
        if (!myClub) {
            return res.status(405).send('club not found');
        }
        console.log(myClub)
        res.status(200).send(myClub)
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

export default router