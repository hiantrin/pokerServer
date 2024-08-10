


import mongoose from "mongoose";
import { createDeck, shuffleDeck, dealCards, dealCommunityCards } from './deckUtils.js';
import { setRoomState } from "./roomState.js";
import PokerRoom from "../models/PokerRooms.js";


const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const checkMove = async (userId, roomId) => {
  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (!room || userId !== room.playersTurn)
      return
    let index = room.playersData.findIndex(player => player.userId === userId);
    room.playersData[index].checked = true
    const playersDontChecked = room.playersData.filter((item) => item.checked == false)
    if (playersDontChecked.length == 0)
    {
      if (room.gameRound == "flop")
        room.gameRound = "turn"
      else if (room.gameRound == "turn")
        room.gameRound = "river"
      let counter = 0
      while (counter < room.playersData.length)
      {
        room.playersData[counter].checked = false
        counter++
      }
    }
    let i = 0
    while (i < room.players.length)
    {
        if (room.players[i] == room.playersTurn &&  i == room.players.length - 1)
        {
          room.playersTurn = room.players[0]
          break
        }
        else if (room.players[i] == room.playersTurn)
        {
          room.playersTurn = room.players[i + 1]
          break
        }
        i++
    }
    await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
    
  } catch (err) {
    console.log(err)
  }

}

export const playerFolded = async (userId, roomId, io) => {
  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (!room || userId !== room.playersTurn)
      return
    if (room.players.length == 2) {
      let index = room.playersData.findIndex(player => player.userId !== userId);
      room.playersData[index].userShips = room.playersData[index].userShips + room.paud
      await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
        $set : {playersData: room.playersData}
      }, {new: true, runValidators: true} )
      await startTheGame(roomId, io)
    }

  } catch (err) {
    console.log(err)
  }
}


export const raiseAction = async (userId, amount, roomId) => {
  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (!room || userId !== room.playersTurn)
      return
    let index = room.playersData.findIndex(player => player.userId === userId);
    room.paud = amount +  room.paud
    room.playersData[index].userShips = room.playersData[index].userShips - amount
    if (room.lastRaise == room.playersData[index].bet)
      room.lastRaise = room.lastRaise + amount
    else 
      room.lastRaise = room.playersData[index].bet  + amount
    room.playersData[index].bet = room.playersData[index].bet + amount
    
    let i = 0
    while (i < room.players.length)
    {
        if (room.players[i] == room.playersTurn &&  i == room.players.length - 1)
        {
          room.playersTurn = room.players[0]
          break
        }
        else if (room.players[i] == room.playersTurn)
        {
          room.playersTurn = room.players[i + 1]
          break
        }
        i++
    }
    if (room.gameRound !== "preflop")
    {
      room.checking = false
      let counter = 0
      while (counter < room.playersData.length)
      {
        room.playersData[counter].checked = false
        counter++
      }

    }
    await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });

  } catch (err) {
    console.log(err)
  }

}
 
export const callLastRaise = async (userId, roomId) => {
  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (!room || userId !== room.playersTurn)
      return
    let index = room.playersData.findIndex(player => player.userId === userId);
    room.paud = (room.lastRaise - room.playersData[index].bet) < room.playersData[index].userShips ?  (room.lastRaise - room.playersData[index].bet) +  room.paud : room.playersData[index].userShips + room.paud
    room.playersData[index].userShips = room.playersData[index].userShips - (room.lastRaise - room.playersData[index].bet) > room.playersData[index].userShips ? room.playersData[index].userShips - (room.lastRaise - room.playersData[index].bet) : 0
    room.playersData[index].bet = room.lastRaise
    
    let i = 0
    while (i < room.players.length)
      {
        if (room.players[i] == room.playersTurn &&  i == room.players.length - 1)
        {
          room.playersTurn = room.players[0]
          break
        }
        else if (room.players[i] == room.playersTurn)
        {
          room.playersTurn = room.players[i + 1]
          break
        }
        i++
      }
      const check = room.playersData.filter((item) => item.bet !== room.lastRaise)
      if (check.length == 0)
      {
          if (room.gameRound == "preflop")
            room.gameRound = "flop"
          else if (room.gameRound == "flop")
            room.gameRound = "turn"
          else if (room.gameRound == "turn")
            room.gameRound = "river"
          room.lastRaise = 0
          room.checking = true
          let counter = 0
          while (counter < room.playersData.length)
          {
            room.playersData[counter].bet = 0
            room.playersData[counter].checked = false
            counter++
          }
        
      }
      await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
  } catch (err) {
    console.log(err)
  }
}

// export const checkIfFinished = async (io, room) => {
//   const check = room.playersData.filter((item) => item.bet !== room.lastRaise)
//   if (check.length == 0)
//   {
//     if (room.gameRound == "preflop")
//       console.log("this the time for flop")
//   }
// }




const startTheGame = async (roomId, io) => {

  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (room) {
      // create deck, shuffle it then deal the cards to users
      const deck = createDeck();
      shuffleDeck(deck);
      const hands = dealCards(deck, room.players.length);
      const communityCards = dealCommunityCards(deck);
      room.communityCards = communityCards;
      room.gameStarted = true

      room.playersData = hands.map((hand, index) => ({
        userId: room.playersData[index].userId,
        currentCards: hand.hand,
        currentTextEmoji: "",
        userShips: room.playersData[index].userShips,
        avatar: room.playersData[index].avatar,
        avatar64: room.playersData[index]?.avatar64 ? room.playersData[index].avatar64 : null,
        playerStatus: 'normal',
        inTheGame: true,
        raised: 0,
        lastRaise: room.bigBlind,
        bet: 0,
        checked: false
      }));
      let i = 0;
        room.playersData[0].userShips = room.playersData[0].userShips - room.smallBlind
        room.playersData[0].bet = room.smallBlind
        room.playersData[1].userShips = room.playersData[1].userShips - room.bigBlind
        room.playersData[1].bet = room.bigBlind
        room.paud = room.bigBlind + room.smallBlind
        room.lastRaise = room.bigBlind
        room.checking = false
        if (room.players.length == 2 ) {
          room.playersTurn = room.players[0]
        }
        else 
          room.playersTurn = room.players[2]
        await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
        io.to(roomId).emit('updatePlayers');
    }
  } catch (err) {
    console.error('Error finding the room:', err);
    return err
  }
};

export default startTheGame


// const changePlayersTurn = async (roomId, io) => {
//   let i = 0
//   const room = await pokerRoomCollection.findOne({ roomId: roomId });
//   // await checkIfFinished(io, room)
//   while (i < room.players.length)
//   {
//     if (room.players[i] == room.playersTurn &&  i == room.players.length - 1)
//     {
//       room.playersTurn = room.players[0]
//       break
//     }
//     else if (room.players[i] == room.playersTurn)
//     {
//       room.playersTurn = room.players[i + 1]
//       break
//     }
//     i++
//   }
//   try {
//     await pokerRoomCollection.findOneAndUpdate({roomId: room.roomId}, {
//       $set : {playersTurn : room.playersTurn}
//     }, {new: true, runValidators: true} )

//   } catch (err) {
//     console.log(err)
//   }
  
//   io.to(room.roomId).emit('updatePlayers');
// }