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
import friendsRoute from "./routes/friends.js"





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
const pokerRoomCollection = db.collection("pokerrooms")


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
app.use("/friends", friendsRoute)



io.on('connection', (socket) => {

  // Handle 'login' event
  socket.on('joinRoom', async (room) => {
    socket.join(room);
    io.to(room).emit('updatePlayers');
    try {
      const hasTwoPlayers = await checkToStartGame(room);
      if (hasTwoPlayers)
        startTheGame(room, io, socket)
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

  // sockets responsible for the game 
  socket.on('call', async (data) => {
    const { userId, amount, roomId } = data;
    try {
      const roomObj = await startTheGame(roomId, io, socket);
      const room = await pokerRoomCollection.findOne({ roomId: roomId });
      let counter = room.players.indexOf(roomObj.playersTurn)
      console.log('==================================================')
      console.log("counter based on indexof :: ", counter)
      console.log('==================================================')
      

      if (roomObj.gameRound === "preflop"){
        console.log('==================================================')
        console.log("counter inside preflop :: ", counter)
        console.log('==================================================')

        if (counter < room.players.length && counter !== 0){
          console.log('==================================================')
          console.log("counter < room.players.length :: ", counter)
          console.log('==================================================')
          await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId, 'playersData.userId': room.players[counter] },
            { $set: { 
              'playersData.$.userShips': room.playersData[counter].userShips - room.lastRaise,
              'playersData.$.raised': room.lastRaise,
             } },
            { new: true, runValidators: true }
          );

          room.playersData.map((player)=>{
            if (player.userId === room.playersTurn){
              player.userShips -= room.lastRaise
            }
          })

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {'paud': room.paud + room.lastRaise}
          }, { returnDocument: 'after', runValidators: true })
          io.to(roomId).emit('updatePlayers');

          // increase the paud in "room" object
          room.paud += room.lastRaise
          counter++

          console.log('==================================================')
          console.log("counter after increamment :: ", counter)
          console.log('==================================================')

          if (counter === room.players.length && room.firstTurn){
            console.log('==================================================')
            console.log("counter === room.players.length :: ", counter)
            console.log('==================================================')
            await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
              $set : {playersTurn: room.players[0]}
            }, { returnDocument: 'after', runValidators: true })
            await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
              $set : {firstTurn: false}
            }, { returnDocument: 'after', runValidators: true })
            io.to(roomId).emit('updatePlayers');
            room.playersTurn = room.players[0]
          }
        }else if (counter === 0 && room.firstTurn){

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {firstTurn: false}
          }, { returnDocument: 'after', runValidators: true })
          
          await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId, 'playersData.userId': room.players[counter] },
            { $set: { 
              'playersData.$.userShips': room.playersData[counter].userShips - room.lastRaise,
              'playersData.$.raised': room.lastRaise,
             } },
            { new: true, runValidators: true }
          );

          room.playersData.map((player)=>{
            if (player.userId === room.playersTurn){
              player.userShips -= room.lastRaise
            }
          })

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {'paud': room.paud + room.lastRaise}
          }, { returnDocument: 'after', runValidators: true })
          io.to(roomId).emit('updatePlayers');

          // increase the paud in "room" object
          room.paud += room.lastRaise
          counter++
        }
        // }else if (counter === room.players.length && room.firstTurn){
        //   counter = 0

        //   await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
        //     $set : {firstTurn: false}
        //   }, { returnDocument: 'after', runValidators: true })

        //   //just added it
        //   await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
        //     $set : {playersTurn: room.players[counter]}
        //   }, { returnDocument: 'after', runValidators: true })

        //   await pokerRoomCollection.findOneAndUpdate(
        //     { roomId: roomId, 'playersData.userId': room.players[counter] },
        //     { $set: { 
        //       'playersData.$.userShips': room.playersData[counter].userShips - room.lastRaise,
        //       'playersData.$.raised': room.lastRaise,
        //      } },
        //     { new: true, runValidators: true }
        //   );

        //   await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
        //     $set : {'paud': room.paud + room.lastRaise}
        //   }, { returnDocument: 'after', runValidators: true })
        //   io.to(roomId).emit('updatePlayers');

        //   // modify user ships in the "room" object
          
        //   room.playersData.map((player)=>{
        //     if (player.userId === room.playersTurn)
        //         player.userShips -= room.lastRaise
        //   })
        //   // increase the paud in "room" object
        //   room.paud += room.lastRaise
        //   counter = room.players.length 
        // }else if (counter === room.players.length && !room.firstTurn){
        //   console.log('Not suposed to come here :: 2')

        //   let userWithBellowRaise = room.playersData.find(player => {
        //     if (player.raised < room.lastRaise && player.inTheGame === true)
        //       return true
        //   })

        //   if (userWithBellowRaise === undefined){
        //     console.log('salina preflop')
        //     room.gameRound = 'flop'
        //     await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
        //       $set : {gameRound: 'flop'}
        //     }, { returnDocument: 'after', runValidators: true })
        //     io.to(roomId).emit('updatePlayers');
        //   }else{
        //     console.log('ba9i masalina')
        //     room.playersTurn = userWithBellowRaise.userId
        //     await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
        //       $set : {playersTurn: userWithBellowRaise.userId}
        //     }, { returnDocument: 'after', runValidators: true })
        //     io.to(roomId).emit('updatePlayers');
        //   }
      }
    } catch (err) {
      console.error('Error starting the game:', err);
    }
  });

  socket.on('raise', (data) => {
    const { userId, amount, roomId } = data;
    // Add logic to handle 'raise'
    console.log("data in raise::")
    console.log('=======================================')
    console.log(data)
    console.log('=======================================')
  });

  socket.on('fold', (data) => {
    const { userId, amount, roomId } = data;
    // Add logic to handle 'raise'
    console.log("data in fold::")
    console.log('=======================================')
    console.log(data)
    console.log('=======================================')
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