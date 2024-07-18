import express from 'express'
import bodyParser from "body-parser"
import dotenv from 'dotenv';
import usersRoute from './routes/createUser.js'
import infosRoute from './routes/getUserInfos.js'
import mongoose from "mongoose";
import storeRoute from "./routes/buyFromStore.js"
import tableRoute from "./routes/createTable.js"
import playsRoute from "./routes/pokerPlays.js"
import clubRoute from "./routes/clubs.js"
import { Server as SocketServer } from 'socket.io'
import http from 'http'
import cors from 'cors'
import checkToStartGame from './utils/checkToStartGame.js';
import startTheGame from './utils/startTheGame.js';
import leaveTheGame from './utils/leaveTheGame.js'





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
app.use(cors());

app.use((req, res, next) => {
  req.io = io;
  next();
});


app.use('/user', usersRoute, infosRoute)
app.use('/store', storeRoute)
app.use('/pokerGame', tableRoute)
app.use('/playPoker', playsRoute)
app.use('/clubs', clubRoute)



io.on('connection', (socket) => {

  // Handle 'login' event
  socket.on('joinRoom', async (room) => {
    socket.join(room);
    io.to(room).emit('updatePlayers');
    try {
      const hasTwoPlayers = await checkToStartGame(room);
      if (hasTwoPlayers)
        startTheGame(room, io)
    } catch (error) {
      console.error('Error checking to start game:', error);
    }
  });

  socket.on('leaveRoom', async (room) => {
    socket.leave(room);
    try {
      const hasTwoPlayers = await checkToStartGame(room);
      if (!hasTwoPlayers)
        leaveTheGame(room)
    } catch (error) {
      console.error('Error checking to start game:', error);
    }
    io.to(room).emit('updatePlayers');
  });
});

// const pokerRoomChangeStream = PokerRoom.watch();

// pokerRoomChangeStream.on('change', async (change) => {
//   if (change.operationType === 'update') {
//       const roomId = change.documentKey._id.toString();
//       io.to(roomId).emit("updatePlayers")
//       try {
//         const ohMy = await checkToStartGame(roomId); // Use await to handle the asynchronous function
//         console.log(ohMy);
//       } catch (error) {
//         console.error('Error checking to start game:', error)
//       }
//   }
// });

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