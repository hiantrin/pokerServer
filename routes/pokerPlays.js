import express from "express";
import mongoose from "mongoose";
import checkToken from "../middlewares/checkToken.js";

const router = express.Router();
const db = mongoose.connection;

const pokerRoomCollection = db.collection("pokerrooms");

router.post("/sendText", checkToken, async (req, res) => {
  const { text, roomId } = req.body;
  const userId = req.userId;
  try {
    const room = await pokerRoomCollection.findOneAndUpdate(
      { roomId, "playersData.userId": req.userId }, // Find the room and the specific player
      { $set: { "playersData.$.currentTextEmoji": text } }, // Update the specific field
      { returnDocument: "after", runValidators: true } // Return the updated document
    );

    if (!room) {
      return res.status(404).send("Room or player not found");
    }
    req.io.to(roomId).emit("updatePlayers", room);
    res.status(200).send("nice one");
  } catch (err) {
    console.log(err);
    res.status(400).send("Internal server error");
  }
});

export default router;
