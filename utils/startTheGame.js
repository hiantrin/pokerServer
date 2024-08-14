


import mongoose from "mongoose";
import { createDeck, shuffleDeck, dealCards, dealCommunityCards } from './deckUtils.js';
import { setRoomState } from "./roomState.js";
import PokerRoom from "../models/PokerRooms.js";
import { getBestHandPlayers } from "./getWinners.js";
import User from "../models/Users.js";


const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")


export const allIn = async (userId, roomId, io) => {
	try {
		const room = await pokerRoomCollection.findOne({ roomId: roomId });
		if (!room || userId !== room.playersTurn)
		  return
		let index = room.playersData.findIndex(player => player.userId === userId);
		room.paud = room.paud + room.playersData[index].userShips
    room.playersData[index].userShips = 0
    room.playersData[index].bet = room.playersData[index].bet + room.playersData[index].userShips
    if (room.lastRaise < room.playersData[index].bet)
      room.lastRaise = room.playersData[index].bet
	else {
		const otherPlayers = room.playersData.filter((item) => item.userId !== userId)
		const finishedPlayers = otherPlayers.filter((item) => item.userShips > 0 && item.inTheGame )
		const allbet = otherPlayers.filter((item) => item.bet !== room.lastRaise)
		if (finishedPlayers.length == 0) {
			room.gameRound = "river"
			room.playersTurn = null
			const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
			let i = 0
			while (i < win.length)
			{
				let myIndex = room.playersData.findIndex(player => player.userId === win[i]);
				room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.length)
				i++
			}
			await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
			io.to(roomId).emit('updatePlayers');
			setTimeout(async () => {
				await startTheGame(roomId, io)
			}, 2000)
			return
		} else if (allbet.length == 0) {
			if (room.gameRound == "flop")
				room.gameRound = "turn"
			else if (room.gameRound == "turn")
				room.gameRound = "river"
			else if (room.gameRound = "river")
			{
				const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
				let i = 0
				while (i < win.length)
				{
					let myIndex = room.playersData.findIndex(player => player.userId === win[i]);
					room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.length)
					i++
				}
				await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
				setTimeout(async () => {
					await startTheGame(roomId, io)
				}, 2000)
				return
			}
			let counter = 0
			while (counter < room.playersData.length)
			{
				room.playersData[counter].checked = false
				counter++
			}
		}

	}
	room.playersTurn = nextPlayer(room)
    await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
    // const check = room.playersData.filter((item) => item.userShips > 0)



	} catch (err) {
		console.log(err)
	}
}

export const checkMove = async (userId, roomId, io) => {
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
		else if (room.gameRound = "river")
		{
			const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
			let i = 0
			while (i < win.length)
			{
				let myIndex = room.playersData.findIndex(player => player.userId === win[i]);
				room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.length)
				i++
			}
			await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
			await startTheGame(roomId, io)
			return
		}
		let counter = 0
		while (counter < room.playersData.length)
		{
			room.playersData[counter].checked = false
			counter++
		}
    }
    room.playersTurn = nextPlayer(room)
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
    else {
		let i = room.playersData.findIndex(player => player.userId === userId);
		room.playersData[i].inTheGame = false
		room.playersTurn = nextPlayer(room)
		const playerInGame = room.playersData.filter((item) => item.inTheGame == true)
		if(playerInGame.length == 1)
		{
			let index = room.playersData.findIndex(player => player.userId === playerInGame[0].userId);
			room.playersData[index].userShips = room.playersData[index].userShips + room.paud
		}
		await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
		if (playerInGame.length == 1)
		{
			await startTheGame(roomId, io)
			return
		}
    }
  } catch (err) {
    console.log(err)
  }
}


export const nextPlayer = (room) => {
  let index = room.players.findIndex(player => player === room.playersTurn);
  const part1 = room.players.slice(index);
  const part2 = room.players.slice(0, index);
  const newArray = part1.concat(part2);
  let i = 1
  while (i < newArray.length)
    {
      const playerData = room.playersData.filter((item) => item.userId == newArray[i])
        if (playerData[0].inTheGame && playerData[0].userShips > 0)
        {
          room.playersTurn = newArray[i]
          return room.playersTurn
        }
        i++
    }
  return 
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
    
    room.playersTurn = nextPlayer(room)
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
 
const checkIfAllOut = (userId, room, index) => {
	console.log("enterd here")
	const remainingPlayers = room.playersData.filter((item) => item.userId !== userId)
	const myPlayers = remainingPlayers.filter((item) => item.userShips > 0 && item.inTheGame)
	if (myPlayers.length == 0)
		return true
  	return false
}

export const callLastRaise = async (userId, roomId, io) => {
  try {
    const room = await pokerRoomCollection.findOne({ roomId: roomId });
    if (!room || userId !== room.playersTurn)
      return
    let index = room.playersData.findIndex(player => player.userId === userId);
    room.paud = (room.lastRaise - room.playersData[index].bet) +  room.paud 
    room.playersData[index].userShips = room.playersData[index].userShips - (room.lastRaise - room.playersData[index].bet)
	room.playersData[index].bet = room.lastRaise
    
  	if (checkIfAllOut(userId, room, index))
    {
		const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
		let i = 0
		while (i < win.length)
		{
			let myIndex = room.playersData.findIndex(player => player.userId === win[i]);
			room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.length)
			i++
		}

		await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
		await startTheGame(roomId, io)
		return
    }

    room.playersTurn = nextPlayer(room)
      const check = room.playersData.filter((item) => item.bet !== room.lastRaise && item.inTheGame)
      if (check.length == 0)
      {
          if (room.gameRound == "preflop")
            room.gameRound = "flop"
          else if (room.gameRound == "flop")
            room.gameRound = "turn"
          else if (room.gameRound == "turn")
            room.gameRound = "river"
		  else if (room.gameRound = "river")
			{
				const win  = getBestHandPlayers(room.playersData.filter((item) => item.inTheGame), room.communityCards)
				let i = 0
				while (i < win.length)
				{
					let myIndex = room.playersData.findIndex(player => player.userId === win[i]);
					room.playersData[myIndex].userShips = room.playersData[myIndex].userShips + (room.paud / win.length)
					i++
				}
				await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
				console.log("start again")
				await startTheGame(roomId, io)
				return
			}
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

const kickUsers = async (room) => {
	const playersOut = room.playersData.filter((item) => item.userShips <= 0)
	let i = 0
	while (i < playersOut.length)
	{
		await User.findByIdAndUpdate(playersOut[i].userId, {
			$set : {roomId: null}
		}, {new: true, runValidators: true})
		room.playersData = room.playersData.filter((item) => item.userId !== playersOut[i].userId)
		room.players = room.players.filter((item) => item !== playersOut[i].userId)
		i++
	}
	return room
}


const startTheGame = async (roomId, io) => {

  try {

	const room = await kickUsers(await pokerRoomCollection.findOne({ roomId: roomId }))
    if (room && room.playersData.length >= 2) {
		let counter = 0
		console.log("it started the game")
		while (counter < room.waitingRoom.length)
		{
			room.playersData.push(room.waitingRoom[counter])
			room.players.push(room.waitingRoom[counter].userId)
			room.waitingRoom = room.waitingRoom.filter((item) => item.userId !== room.waitingRoom[counter].userId)
			counter++
		}
		const deck = createDeck();
		shuffleDeck(deck);
		const hands = dealCards(deck, room.players.length);
		const communityCards = dealCommunityCards(deck);
		room.communityCards = communityCards;
		room.gameStarted = true

		room.playersData = hands.map((hand, index) => ({
			userId: room.playersData[index].userId,
			username: room.playersData[index].username,
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
			checked: false,
			
		}));
		let i = 0;
		while (i < room.playersData.length)
		{
			if (i == 0)
			{
				room.playersData[i].userShips = room.playersData[0].userShips - room.smallBlind
        		room.playersData[i].bet = room.smallBlind
			}
			else {
				room.playersData[i].userShips = room.playersData[i].userShips - room.bigBlind
				room.playersData[i].bet = room.bigBlind
			}
			i++
		}
        room.paud = room.bigBlind + room.smallBlind
        room.lastRaise = room.bigBlind
        room.checking = false
		room.gameRound = "preflop"
        if (room.players.length == 2 ) {
          room.playersTurn = room.players[0]
        }
        else 
          room.playersTurn = room.players[2]
    } else {
		room.playersData[0].bet = 0
		room.playersData[0].inTheGame = true
		room.playersData[0].raised = 0
		room.playersData[0].lastRaise = room.bigBlind0
		room.playersData[0].bet = 0
		room.playersData[0].checked = false
		room.playersData[0].currentCards = []
		room.lastRaise = 0
		room.paud = 0
		room.communityCards = []
		room.gameStarted = false
		room.checking = false
		room.gameRound = "preflop"
	}
	await pokerRoomCollection.updateOne({ roomId: roomId }, { $set : room });
	io.to(roomId).emit('updatePlayers');
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