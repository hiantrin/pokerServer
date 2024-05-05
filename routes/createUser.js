import express from "express";
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import mongoose from "mongoose";
import checkUser from "../middlewares/checkUser.js";



const router = express.Router()
const db = mongoose.connection
const collection = db.collection('users');
import { v4 as uuidv4 } from 'uuid';
import checkUsername from "../middlewares/checkUsername.js";

const generateRandomUsername =  (inputUsername) => {
    const randomNumber = Math.floor(Math.random() * 100000);
    const randomUsername = inputUsername + '_' + randomNumber.toString().padStart(5, '0');
    return randomUsername;
};


const createTheUser = async (infos, req) => {
    const myId = infos?.id && infos.userType !== "guest" ? infos.id : uuidv4()
    const randomUsername = generateRandomUsername(infos.username);
    const token = jwt.sign(myId, process.env.ACCESS_TOKEN_SECRET)
    const user = new User({
        username: randomUsername,
        userType: infos.userType,
        authToken: token,
        avatar: infos?.profile ? infos.profile : null,
        email: infos?.email ? infos.email : null,
        fullName: infos?.fullName ? infos.fullName : null,
        _id: myId,
    })
    await user.save().then((response) => {
        req.error = false;
        req.myToken = response.authToken
    }).catch((err) => {
        console.log("this is the error", err)
        req.error = true
    })
}

router.post('/createUser', checkUsername, async (req, res) => {
   createTheUser(req.body, req)
   if ( req.error )
    {
        console.log("hamza")
        res.status(404).send("database error")
        return
    }
    else
    {
        res.status(200).send(req.myToken)
        return
    }
})

router.post('/createUserGoogle', checkUser(collection), async (req, res) => {
    await createTheUser(req.body, req)
    if ( req.error )
    {
        res.status(404).send("database error")
        return
    }
    else
    {
        res.status(200).send(req.myToken)
        return
    }
})

export default router