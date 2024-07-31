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

router.post("/deleteMember", checkToken, async (req, res) => {
    const {clubId} = req.body
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const club = await clubCollection.findOne({_id: clubId})
        if (!club) {
            return res.status(405).send('User not found');
        }
        await Club.findByIdAndUpdate(clubId, {
            $set : {members: club.members.filter((item) => item._id !== user._id)}
        }, {new: true, runValidators: true})
        const newUser = await User.findByIdAndUpdate(user._id, {
            $set : {clubs: user.clubs.filter((item) => item._id !== clubId)}
        }, {new: true, runValidators: true})
        res.status(200).send(newUser)
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

router.post("/changeClubData", checkToken , async (req, res) => {
    const { clubId , booleans} = req.body
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const newClub = await Club.findByIdAndUpdate(clubId, {
            $set : {private: booleans.private, newGames: booleans.newGames, memberMessages: booleans.messages}
        }, {new: true, runValidators: true})
        const updatedClubs = user.clubs.filter((item) => item._id !== clubId)
        updatedClubs.push(newClub)
        const newUser = await User.findByIdAndUpdate(user._id, {
            $set : {clubs: updatedClubs}
        }, {new: true, runValidators: true})
        return res.status(200).send(newUser)
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

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
        const theUser = await User.findByIdAndUpdate(req.userId,
            {$set: {requests: user.requests.filter((item) => item._id !== requestId), clubs: user.clubs}},
            {new: true, runValidators: true})
            console.log(theUser)
        res.status(200).send(theUser);
    } catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

router.post("/joinClub", checkToken, async (req, res) => {
    const { clubId } = req.body;
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const club = await clubCollection.findOne({_id: clubId})
        if (club.members.filter((item) => item._id == req.userId).length !== 0 || club.requests.filter((item) => item._id == req.userId).length !== 0)
            return res.status(200).send('its aleready here');
        const newRequest = createMember(user)
        club.requests.push(newRequest)
        const clubUpdated = await Club.findByIdAndUpdate(clubId,
            {$set: {requests: club.requests}} , {new: true, runValidators: true}
        )
        res.status(200).send("its updated");
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

router.get("/getAllClubsInfos", checkToken, async (req, res) => {
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const allUsers = await Club.find({})
        res.status(200).send(allUsers)
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

router.post("/acceptClubMembers", checkToken, async (req, res) => {
    const {clubId, theRequest, type} = req.body
    try {
        const user = await userCollection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const myClub = await clubCollection.findOne({_id: clubId})
        if (!myClub) {
            return res.status(405).send('club not found');
        }
        if (type == "accept")
        {
            myClub.members.push(theRequest)
        }
        const newClub = await Club.findByIdAndUpdate(clubId, {
            $set: {requests: myClub.requests.filter((item) => item._id !== theRequest._id), members: myClub.members}
        } ,{new: true, runValidators: true})
        if (type == "accept")
        {
            const requester = await userCollection.findOne({ _id: theRequest._id })
            requester.clubs.push(newClub)
            await User.findByIdAndUpdate(requester._id, {
                $set: {clubs: requester.clubs}
            }, {new: true, runValidators: true})
        }
        return res.status(200).send(newClub)
    } catch {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
})

////////// admin
router.get("/getAllClubs", async (req, res) => {
    try {
        const clubs = await Club.find({})
        if(!clubs)
            res.status(200).send([])
        res.status(200).send(clubs)
    } catch (err) {
        res.status(500).send("Internal server Error")
    }
})

router.post("/deleteMemberAdmin", async (req, res) => {
    const { clubId, memberId } = req.body
    try {
        const user = await userCollection.findOne({ _id: memberId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const myClub = await clubCollection.findOne({_id: clubId})
        if (!myClub) {
            return res.status(405).send('club not found');
        }
        await User.findByIdAndUpdate(user._id, {
            $set : {clubs: user.clubs.filter((item) => item._id !== clubId)}
        }, {new: true, runValidators: true})
        const newClub = await Club.findByIdAndUpdate(clubId, {
            $set : {members: myClub.members.filter((item) => item._id !== memberId)}
        }, {new: true, runValidators: true})
        res.status(200).send(newClub)
    } catch (err) {
        res.status(500).send("Internal server error")
    }
})

export default router