// import mongoose from "mongoose";
// import { createDeck, shuffleDeck, dealCards } from './deckUtils.js';
// import { setRoomState } from "./roomState.js";


// const db = mongoose.connection

// const pokerRoomCollection = db.collection("pokerrooms")


// const listenToRoomChanges = (roomId) => {
//     console.log("enter here")
//     // const changeStream = pokerRoomCollection.watch([
//     //   { $match: { 'fullDocument.roomId': roomId } }
//     // ]);
//     // console.log("next step")
//     // changeStream.on('change', async (change) => {
//     //   try {
//     //     if (change.operationType === 'update' || change.operationType === 'insert') {
//     //       const updatedRoom = await pokerRoomCollection.findOne({ roomId: roomId });
//     //       setRoomState(roomId, updatedRoom); // Update the state
//     //       console.log('Room updated:', updatedRoom);
//     //     }
//     //   } catch (error) {
//     //     console.error('Error handling change stream event:', error);
//     //   }
//     // });
  
//     // changeStream.on('error', (error) => {
//     //   console.error('Change Stream error:', error);
//     // });
//     // const pokerRoomChangeStream = PokerRoom.watch();

// // pokerRoomChangeStream.on('change', async (change) => {
// //   if (change.operationType === 'update') {
// //       const roomId = change.documentKey._id.toString();
//     // const pokerRoomChangeStream = pokerRoomCollection.watch();

//     // pokerRoomChangeStream.on('change', async (change) => {
//     //     if (change.operationType === 'update') {
//     //         const roomId = change.documentKey._id.toString();
//     //         console.log("my Room Id", roomId)
//     //     }
//     // })
// };

// const startTheGame = async (roomId, io) => {

//     listenToRoomChanges(roomId)

//     try {
//       const room = await pokerRoomCollection.findOne({ roomId: roomId });
//       if (!room) {
//         throw new Error('Room not found');
//       }
  
//       const deck = createDeck();
//       shuffleDeck(deck);
//       const players = dealCards(deck, room.players.length);

      
//       // Update the PokerRoom with the new playersData
//       room.playersData = players.map((player, index) => ({
//         userId: room.playersData[index].userId,
//         currentCards: player.hand,
//         currentTextEmoji: "",
//         userShips: room.playersData[index].userShips,
//         avatar: room.playersData[index].avatar,
//         avatar64: room.playersData[index]?.avatar64 ? room.playersData[index].avatar64 : null
//       }));

//       // console.log("this is the room :: ", room)
//       // console.log("players id :: ", room.players)

//       let currentIndex = 0;
//       let counter = 0

//       if (room.players.length >= 2){
//         const currentPlayerId = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
//           $set : {playersTurn: room.players[currentIndex]}
//         }, { returnDocument: 'after', runValidators: true })
//         io.to(roomId).emit('updatePlayers');
//         console.log('Current player :: ', room.players[currentIndex])
//         currentIndex++
//         const interval = setInterval(async() => {
//             // console.log("Players turn :: ", room.players[currentIndex]);
//             // call database to check how many players are left in the room

//             // add
//             console.log('Current player :: ', room.players[currentIndex])


//             const changeStream = pokerRoomCollection.watch([
//               {
//                   $match: {
//                       'updateDescription.updatedFields.gameStarted': { $exists: true }
//                   }
//               }
//           ]);
  
//           changeStream.on('change', (change) => {
//               // Handle change event
//               // console.log('Change detected:', change);
  
//               if (change.operationType === 'update') {
//                   const updatedFields = change.updateDescription.updatedFields;
//                   if (updatedFields.hasOwnProperty('gameStarted')) {
//                       // console.log('gameStarted field changed:', updatedFields.gameStarted);
//                       if (updatedFields.gameStarted === false){
//                         console.log("Stop the game")
//                         clearInterval(interval)
//                       }
//                   }
//               }
//           });


//              const currentPlayerId = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
//                 $set : {playersTurn: room.players[currentIndex]}
//               }, { returnDocument: 'after', runValidators: true })
//               io.to(roomId).emit('updatePlayers');
//             // console.log("Players turn prime :: ", currentPlayerId);
//             currentIndex++;
//             counter++
            
//             // If we've reached the end of the array, start over
//             if (currentIndex >= room.players.length) {
//                 currentIndex = 0;
//             }
//         }, 10000);

//       }

//       // room.playersData

//       const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
//         $set : {playersData: room.playersData, gameStarted: true}
//       }, { returnDocument: 'after', runValidators: true })
//       // Emit the updated players data to the room
//     //   while (newRoom.gameStarted == true) {
//     //     console.log("am still going")

//     //   } 
//       io.to(roomId).emit('updatePlayers');
//     } catch (error) {
//       console.error('Error starting the game:', error);
//     }
//   }

// export default startTheGame




import mongoose from "mongoose";
import { createDeck, shuffleDeck, dealCards, dealCommunityCards } from './deckUtils.js';
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

// const startTheGame = async (roomId, io) => {

//     listenToRoomChanges(roomId)

//     try {
//       const room = await pokerRoomCollection.findOne({ roomId: roomId });
//       if (!room) {
//         throw new Error('Room not found');
//       }
  
//       const deck = createDeck();
//       shuffleDeck(deck);
//       const players = dealCards(deck, room.players.length);

      
//       // Update the PokerRoom with the new playersData
//       room.playersData = players.map((player, index) => ({
//         userId: room.playersData[index].userId,
//         currentCards: player.hand,
//         currentTextEmoji: "",
//         userShips: room.playersData[index].userShips,
//         avatar: room.playersData[index].avatar,
//         avatar64: room.playersData[index]?.avatar64 ? room.playersData[index].avatar64 : null,
//         playerStatus: 'normal'
//       }));

//       let currentIndex = 0;
//       let counter = 0

//       if (room.players.length >= 2){
//         if (room.gameRound === "start"){
//           const currentPlayerId = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
//             $set : {playersTurn: room.players[currentIndex]}
//           }, { returnDocument: 'after', runValidators: true })

//           console.log('the user :: ')
//           console.log(user)
//           // console.log("updated", updatedRoom)
//           io.to(roomId).emit('updatePlayers');
//           currentIndex++

//         }
//         // console.log('Current player :: ', room.players[currentIndex])
//         const interval = setInterval(async() => {
            

//             const changeStream = pokerRoomCollection.watch([
//               {
//                   $match: {
//                       'updateDescription.updatedFields.gameStarted': { $exists: true }
//                   }
//               }
//           ]);
  
//           changeStream.on('change', (change) => {
//               // Handle change event
//               // console.log('Change detected:', change);
  
//               if (change.operationType === 'update') {
//                   const updatedFields = change.updateDescription.updatedFields;
//                   if (updatedFields.hasOwnProperty('gameStarted')) {
//                       // console.log('gameStarted field changed:', updatedFields.gameStarted);
//                       if (updatedFields.gameStarted === false){
//                         console.log("Stop the game")
//                         clearInterval(interval)
//                       }
//                   }
//               }
//           });


//              const currentPlayerId = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
//                 $set : {playersTurn: room.players[currentIndex]}
//               }, { returnDocument: 'after', runValidators: true })
//               io.to(roomId).emit('updatePlayers');
//             console.log("Players turn prime :: ", currentPlayerId);
//             currentIndex++;
//             counter++
            
//             // If we've reached the end of the array, start over
//             if (currentIndex >= room.players.length) {
//                 currentIndex = 0;
//             }
//         }, 10000);

//       }

//       // room.playersData

//       const newRoom = await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
//         $set : {playersData: room.playersData, gameStarted: true}
//       }, { returnDocument: 'after', runValidators: true })
//       // Emit the updated players data to the room
//     //   while (newRoom.gameStarted == true) {
//     //     console.log("am still going")

//     //   } 
//       io.to(roomId).emit('updatePlayers');
//     } catch (error) {
//       console.error('Error starting the game:', error);
//     }
//   }


const startTheGame = async (roomId, io, socket) => {

  listenToRoomChanges(roomId)
  // console.log(roomId)

  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (room) {
      // creat deck, suffle it then deal the cards to users
      const deck = createDeck();
      shuffleDeck(deck);
      const hands = dealCards(deck, room.players.length);
      const communityCards = dealCommunityCards(deck)
      room.communityCards = communityCards
      
      let newAmountOfShips = 0

      room.playersData = hands.map((hand, index) => ({
        userId: room.playersData[index].userId,
        currentCards: hand.hand,
        currentTextEmoji: "",
        userShips: room.playersData[index].userShips,
        avatar: room.playersData[index].avatar,
        avatar64: room.playersData[index]?.avatar64 ? room.playersData[index].avatar64 : null,
        playerStatus: 'normal',
        inTheGame: true,
        raised: 0
      }));
      io.to(roomId).emit('updatePlayers');

      // sockets
      io.to(roomId).emit('gameStarted', room);
      

      if (room.players.length >= 2){
        let counter = 0
        if (room.gameRound === 'start'){
          room.playersData[counter].playerStatus = 'dealer'

          // just added the community cards
          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {communityCards: room.communityCards}
          }, { returnDocument: 'after', runValidators: true })

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {playersTurn: room.players[counter]}
          }, { returnDocument: 'after', runValidators: true })

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {playersData: room.playersData}
          }, { returnDocument: 'after', runValidators: true })

          await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId, 'playersData.userId': room.players[counter] },
            { $set: { 'playersData.$.playerStatus': 'dealer' } },
            { new: true, runValidators: true }
          );
          io.to(roomId).emit('updatePlayers');
          counter++

          await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId, 'playersData.userId': room.players[counter] },
            { $set: { 
              'playersData.$.playerStatus': 'smallBlind',
              'playersData.$.userShips': room.playersData[counter].userShips - room.smallBlind,
             } },
            { new: true, runValidators: true }
          );
          io.to(roomId).emit('updatePlayers');
          counter++
          if (counter === room.players.length)
            counter = 0

          await pokerRoomCollection.findOneAndUpdate(
            { roomId: roomId, 'playersData.userId': room.players[counter] },
            { $set: { 
              'playersData.$.playerStatus': 'bigBlind',
              'playersData.$.userShips': room.playersData[counter].userShips - room.bigBlind,
             } },
            { new: true, runValidators: true }
          );
          io.to(roomId).emit('updatePlayers');

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {gameRound: 'preflop'}
          }, { returnDocument: 'after', runValidators: true })
          io.to(roomId).emit('updatePlayers');
          counter++

          await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {playersTurn: room.players[counter]}
          }, { returnDocument: 'after', runValidators: true })
          io.to(roomId).emit('updatePlayers');
          room.gameRound = 'preflop'
          if (counter === room.players.length)
            counter = 0
        }
        

        if (room.gameRound === 'preflop'){
          let firstTurn = true

          socket.on('call', async (data) => {
            const { userId } = data;
            
            // Add logic to handle 'call'
            let room = await pokerRoomCollection.findOne({ roomId: roomId }, { lastRaise: 1, _id: 0 });

            if (counter < room.players.length){
              await pokerRoomCollection.findOneAndUpdate(
                { roomId: roomId, 'playersData.userId': room.players[counter] },
                { $set: { 
                  'playersData.$.userShips': room.playersData[counter].userShips - room.lastRaise,
                  'playersData.$.raised': room.lastRaise,
                 } },
                { new: true, runValidators: true }
              );

              // modify user ships in the "room" object
              
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
              if (counter === room.players.length && firstTurn){
                await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
                  $set : {playersTurn: room.players[0]}
                }, { returnDocument: 'after', runValidators: true })
                io.to(roomId).emit('updatePlayers');
                room.playersTurn = room.players[0]
              }
            }else if (counter === room.players.length && firstTurn){
              console.log('Not suposed to come here :: 1')
              firstTurn = false
              counter = 0

              //just added it
              await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
                $set : {playersTurn: room.players[counter]}
              }, { returnDocument: 'after', runValidators: true })

              await pokerRoomCollection.findOneAndUpdate(
                { roomId: roomId, 'playersData.userId': room.players[counter] },
                { $set: { 
                  'playersData.$.userShips': room.playersData[counter].userShips - room.lastRaise,
                  'playersData.$.raised': room.lastRaise,
                 } },
                { new: true, runValidators: true }
              );
  
              await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
                $set : {'paud': room.paud + room.lastRaise}
              }, { returnDocument: 'after', runValidators: true })
              io.to(roomId).emit('updatePlayers');

              // modify user ships in the "room" object
              
              room.playersData.map((player)=>{
                if (player.userId === room.playersTurn)
                    player.userShips -= room.lastRaise
              })
              // increase the paud in "room" object
              room.paud += room.lastRaise
              counter = room.players.length 
            }else if (counter === room.players.length && !firstTurn){
              console.log('Not suposed to come here :: 2')

              let userWithBellowRaise = room.playersData.find(player => {
                if (player.raised < room.lastRaise && player.inTheGame === true)
                  return true
              })

              if (userWithBellowRaise === undefined){
                console.log('salina preflop')
                room.gameRound = 'flop'
                await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
                  $set : {gameRound: 'flop'}
                }, { returnDocument: 'after', runValidators: true })
                io.to(roomId).emit('updatePlayers');
              }else{
                console.log('ba9i masalina')
                room.playersTurn = userWithBellowRaise.userId
                await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
                  $set : {playersTurn: userWithBellowRaise.userId}
                }, { returnDocument: 'after', runValidators: true })
                io.to(roomId).emit('updatePlayers');
              }

              counter = 0
            }
            // await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            //   $set : {playersTurn: room.players[counter]}
            // }, { returnDocument: 'after', runValidators: true })
            // console.log(`${room.playersTurn} called in room ${roomId}`);
            // io.to(roomId).emit('playerCalled', { userId });

            console.log("the bottom of the function.")
            console.log("player id sending the  signal :: ", userId)
            console.log("counter :: ", counter)
            console.log("room.playersTurn :: ", room.playersTurn)
          });

          socket.on('raise', (data) => {
            const { userId, amount } = data;
            // Add logic to handle 'raise'
            console.log("data in bet ::")
            console.log('=======================================')
            console.log(data)
            console.log('=======================================')
            console.log(`${room.playersTurn} raised ${amount} in room ${roomId}`);
            io.to(roomId).emit('playerRaised', { userId, amount });
          });

          socket.on('fold', async (data) => {
            const { userId } = data;
            // Add logic to handle 'fold'
            console.log("data in fold ::")
            console.log('=======================================')
            console.log(data)
            console.log('=======================================')

            await pokerRoomCollection.findOneAndUpdate(
              { roomId: roomId, 'playersData.userId': room.players[counter] },
              { $set: { 
                'playersData.$.inTheGame': false,
               } },
              { new: true, runValidators: true }
            );
            io.to(roomId).emit('updatePlayers');

            console.log(`${room.playersTurn} folded in room ${roomId}`);
            io.to(roomId).emit('playerFolded', { userId });
          });
        }

        if (room.gameRound === 'flop'){
          // Set up event listeners for the game
          socket.on('call', (data) => {
            const { userId } = data;
            // Add logic to handle 'call'
            console.log(`${room.playersTurn} called in room ${roomId}`);
            io.to(roomId).emit('playerCalled', { userId });
          });

          socket.on('raise', (data) => {
            const { userId, amount } = data;
            // Add logic to handle 'raise'
            console.log(`${room.playersTurn} raised ${amount} in room ${roomId}`);
            io.to(roomId).emit('playerRaised', { userId, amount });
          });

          socket.on('fold', (data) => {
            const { userId } = data;
            // Add logic to handle 'fold'
            console.log(`${room.playersTurn} folded in room ${roomId}`);
            io.to(roomId).emit('playerFolded', { userId });
          });
        }
      }

    } else {
      console.log('Room not found');
    }
  } catch (err) {
    console.error('Error finding the room:', err);
  }
  
}

export default startTheGame


// check with Hamza why BET Button is not working
// check with Hamza the userId why is not in the data i get.
// in the raise part it's crucial to know how much the player had raised. so i have to get it "data"

/* first keep moving in the players array till the end 
    then check for the player that has not raised at the last raise give him the turn to play then go to the next one.
*/

// every addition in the real database i have to do the same in the object "room" to avoid the async code 
// 




 // // Set up event listeners for the game
      // socket.on('raise', (data) => {
      //   const { userId, amount } = data;
      //   // Add logic to handle 'raise'
      //   console.log(`${userId} raised ${amount} in room ${roomId}`);
      //   io.to(roomId).emit('playerRaised', { userId, amount });
      // });

      // socket.on('call', (data) => {
      //   const { userId } = data;
      //   // Add logic to handle 'call'
      //   console.log(`${userId} called in room ${roomId}`);
      //   io.to(roomId).emit('playerCalled', { userId });
      // });

      // socket.on('fold', (data) => {
      //   const { userId } = data;
      //   // Add logic to handle 'fold'
      //   console.log(`${userId} folded in room ${roomId}`);
      //   io.to(roomId).emit('playerFolded', { userId });
      // });

      // socket.on('bet', (data) => {
      //   const { userId, amount } = data;
      //   // Add logic to handle 'bet'
      //   console.log(`${userId} bet ${amount} in room ${roomId}`);
      //   io.to(roomId).emit('playerBet', { userId, amount });
      // });


      // tester 
      // try {
      //   console.log("room.players[0]", room.players[0]);
      //   console.log("roomId :: ", roomId);
      
      //   // Check the current document state before updating
      //   const currentDocument = await pokerRoomCollection.findOne({ roomId: roomId });
      //   console.log("Current document before update:", currentDocument);
      
      //   const result = await pokerRoomCollection.findOneAndUpdate(
      //     { roomId: roomId },
      //     { $set: { playersTurn: room.players[0] } },
      //     { returnDocument: 'after', runValidators: true }
      //   );
      
      //   console.log("Update result:", result);
      
      //   if (result) {
      //     console.log("Update successful:", result);
      //   } else {
      //     console.log("No matching document found or no changes made.");
      //   }
      
      //   // Check the updated document state after updating
      //   const updatedDocument = await pokerRoomCollection.findOne({ roomId: roomId });
      //   console.log("Updated document after update:", updatedDocument);
      
      //   io.to(roomId).emit('updatePlayers');
      // } catch (error) {
      //   console.error("Error updating document:", error);
      // }