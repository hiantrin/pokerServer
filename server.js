import express from 'express'
import bodyParser from "body-parser"
import dotenv from 'dotenv';
import usersRoute from './routes/createUser.js'
import infosRoute from './routes/getUserInfos.js'
import mongoose from "mongoose";
import storeRoute from "./routes/buyFromStore.js"
import tableRoute from "./routes/createTable.js"
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import cors from 'cors'





dotenv.config();
const app = express()
const PORT = 3000
const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
      origin: '*',
    }
  });

mongoose.connect(process.env.MONGO_URL)

const db = mongoose.connection
db.on('error', (error) => console.error("database error", error))
db.once('open', () => console.log('connected to Database'))


app.use(bodyParser.json({ limit: '10mb' }))






app.use('/user', usersRoute, infosRoute)
app.use('/store', storeRoute)
app.use('/pokerGame', tableRoute)


io.on('connection', (socket) => {

  // Handle 'login' event
  socket.on('login', () => {
    socket.broadcast.emit('updatePlayers');
  });

    // Handle disconnection
});

app.get("/", (req, res) => {
    res.send('hamza learning node js and express')
})



server.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log("Server started on port:", `http://localhost:${PORT}`);
    }
})