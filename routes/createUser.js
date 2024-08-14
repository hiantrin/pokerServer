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
    try {
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
        const response = await user.save()
        return { error: false, authToken: response.authToken };
    } catch (err) {
        return { error: true };
    }
}

router.post('/createUser', checkUsername, async (req, res) => {
    const result = await createTheUser(req.body, req)
    if (result.error) {
        res.status(500).send("Database error");
    } else {
        res.status(200).send(result.authToken);
    }
})

router.post('/createUserGoogle', checkUser(collection), async (req, res) => {
    const result = await createTheUser(req.body, req)
    if (result.error) {
        res.status(500).send("Database error");
    } else {
        res.status(200).send(result.authToken);
    }
})

export default router