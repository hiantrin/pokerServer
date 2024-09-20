import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import usersRoute from "./routes/createUser.js";
import infosRoute from "./routes/getUserInfos.js";
import mongoose from "mongoose";
import storeRoute from "./routes/buyFromStore.js";
import tableRoute from "./routes/createTable.js";
import stripePayment from "./routes/stripePayment.js";
import playsRoute from "./routes/pokerPlays.js";
import clubRoute from "./routes/clubs.js";
import { Server as SocketServer } from "socket.io";
import http from "http";
import cors from "cors";
import checkToStartGame from "./utils/checkToStartGame.js";
import startTheGame from "./utils/startTheGame.js";
import friendsRoute from "./routes/friends.js";
import { raiseAction } from "./utils/playerMoves/raise.js";
import { checkMove } from "./utils/playerMoves/check.js";
import { allIn } from "./utils/playerMoves/allIn.js";
import { callLastRaise } from "./utils/playerMoves/call.js";
import { playerFolded } from "./utils/playerMoves/fold.js";
import { quickRobot } from "./utils/robot/createRobot.js";

dotenv.config();
const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on("error", (error) => console.error("database error", error));
db.once("open", () => console.log("connected to Database"));
const pokerRoomCollection = db.collection("pokerrooms");

// app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/user", bodyParser.json(), usersRoute, infosRoute);
app.use("/store", bodyParser.json(), storeRoute);
app.use("/pokerGame", bodyParser.json(), tableRoute);
app.use("/playPoker", bodyParser.json(), playsRoute);
app.use("/clubs", bodyParser.json(), clubRoute);
app.use("/friends", bodyParser.json(), friendsRoute);
app.use("/stripe", stripePayment);

io.on("connection", (socket) => {
  // Handle 'login' event
  socket.on("joinRoom", async (room, player) => {
    socket.join(room);
    if (player) {
      try {
        const hasTwoPlayers = await checkToStartGame(room);
        if (hasTwoPlayers) await startTheGame(room, io);
      } catch (error) {
        console.error("Error checking to start game:", error);
      }
    }
  });

  socket.on("leaveRoom", async (room) => {
    socket.leave(room);
  });

  // sockets responsible for the game
  socket.on("call", async (data) => {
    const { userId, roomId } = data;
    try {
      await callLastRaise(userId, roomId, io);
    } catch (err) {
      console.error("Error starting the game:", err);
    }
  });

  socket.on("raise", async (data) => {
    const { userId, amount, roomId } = data;
    try {
      await raiseAction(userId, amount, roomId, io);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("fold", async (data) => {
    const { userId, roomId } = data;
    await playerFolded(userId, roomId, io);
    io.to(roomId).emit("playerFolded", userId);
  });

  socket.on("check", async (data) => {
    const { userId, roomId } = data;
    try {
      await checkMove(userId, roomId, io);
    } catch (err) {
      console.error("Error starting the game:", err);
    }
  });

  socket.on("allIn", async (data) => {
    const { userId, roomId } = data;
    try {
      await allIn(userId, roomId, io);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("addRobot", async (roomId) => {
    try {
      const hasTwoPlayers = await checkToStartGame(roomId);
      if (hasTwoPlayers) await startTheGame(roomId, io);
    } catch (error) {
      console.error("Error checking to start game:", error);
    }
  });

  socket.on("kickRobot", async (data) => {
    const { roomId, robotId } = data;
    try {
      await quickRobot(roomId, robotId, io);
    } catch (err) {
      console.log(err);
    }
  });
});

app.get("/", (req, res) => {
  res.send("hamza learning node js and express");
});

server.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server started on port:", `http://localhost:${PORT}`);
  }
});
