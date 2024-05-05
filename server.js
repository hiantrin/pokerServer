import express from 'express'
import bodyParser from "body-parser"
import dotenv from 'dotenv';
import usersRoute from './routes/createUser.js'
import infosRoute from './routes/getUserInfos.js'
import mongoose from "mongoose";
import storeRoute from "./routes/buyFromStore.js"




dotenv.config();
const app = express()
const PORT = 5000

mongoose.connect(process.env.MONGO_URL)

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to Database'))


app.use(bodyParser.json({ limit: '10mb' }))

app.use('/user', usersRoute, infosRoute)
app.use('/store', storeRoute)

app.get("/", (req, res) => {
    res.send('hamza learning node js and express')
})

app.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log("Server started on port:", `http://localhost:${PORT}`);
    }
})