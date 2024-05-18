import mongoose from "mongoose";
import { createDeck, shuffleDeck, dealCards } from './deckUtils.js';
import { setRoomState } from "./roomState.js";


const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


const listenToRoomChanges = (roomId) => {
    console.log("enter here")
    // const changeStream = pokerRoomCollection.watch([
    //   { $match: { 'fullDocument.roomId': roomId } }
    // ]);
    // console.log("next step")
    // changeStream.on('change', async (change) => {
    //   try {
    //     if (change.operationType === 'update' || change.operationType === 'insert') {
    //       const updatedRoom = await pokerRoomCollection.findOne({ roomId: roomId });
    //       setRoomState(roomId, updatedRoom); // Update the state
    //       console.log('Room updated:', updatedRoom);
    //     }
    //   } catch (error) {
    //     console.error('Error handling change stream event:', error);
    //   }
    // });
  
    // changeStream.on('error', (error) => {
    //   console.error('Change Stream error:', error);
    // });
    // const pokerRoomChangeStream = PokerRoom.watch();

// pokerRoomChangeStream.on('change', async (change) => {
//   if (change.operationType === 'update') {
//       const roomId = change.documentKey._id.toString();
    // const pokerRoomChangeStream = pokerRoomCollection.watch();

    // pokerRoomChangeStream.on('change', async (change) => {
    //     if (change.operationType === 'update') {
    //         const roomId = change.documentKey._id.toString();
    //         console.log("my Room Id", roomId)
    //     }
    // })
};

const startTheGame = async (roomId, io) => {

    listenToRoomChanges(roomId)

    try {
      const room = await pokerRoomCollection.findOne({ roomId: roomId });
      if (!room) {
        throw new Error('Room not found');
      }
  
      const deck = createDeck();
      shuffleDeck(deck);
      const players = dealCards(deck, room.players.length);
  
      // Update the PokerRoom with the new playersData
      room.playersData = players.map((player, index) => ({
        userId: room.playersData[index].userId,
        currentCards: player.hand,
        currentTextEmoji: "",
        userShips: room.playersData[index].userShips,
        avatar: room.playersData[index].avatar,
        avatar64: room.playersData[index]?.avatar64 ? room.playersData[index].avatar64 : null
      }));

      const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
        $set : {playersData: room.playersData, gameStarted: true}
      }, { returnDocument: 'after', runValidators: true })
      // Emit the updated players data to the room
    //   while (newRoom.gameStarted == true) {
    //     console.log("am still going")

    //   } 
      io.to(roomId).emit('updatePlayers');
    } catch (error) {
      console.error('Error starting the game:', error);
    }
  }

export default startTheGame