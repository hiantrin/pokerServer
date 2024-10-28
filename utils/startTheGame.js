import mongoose from "mongoose";
import { createDeck, shuffleDeck, dealCards, dealCommunityCards } from './deckUtils.js';
import { setRoomState } from "./roomState.js";
import PokerRoom from "../models/PokerRooms.js";
import User from "../models/Users.js";
import robotPlays from "./robot/robotPlays.js";
import { playerFolded } from "./playerMoves/fold.js";
import { checkMove } from "./playerMoves/check.js";


const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

// const runListenerTurn = async (roomId, io) => {
//     const pokerRoomsChangeStream = PokerRoom.watch();
    
//     pokerRoomsChangeStream.on('change', async (change) => {
//         if (
//             change.operationType === 'update' &&
//             change.documentKey._id &&
//             change.updateDescription.updatedFields.hasOwnProperty('playersTurn')
//         ) {
//             console.log("playersTurn updated");
//             const room = await PokerRoom.findOne({ _id: change.documentKey._id });
            
//             if (room && room.playersTurn !== null && room.roomId === roomId) {
//                 let index = room.playersData.findIndex((player) => player.userId == room.playersTurn);

//                 // If it's a robot's turn
//                 if (room.playersData[index].robot === true) {
//                     setTimeout(async () => {
//                         await robotPlays(room, index, io);
//                     }, 3000);
//                 } else {
//                     handlePlayerTurnTimeout(room, roomId, io, room.playersTurn);
//                 }
//             }
//         }

//         if (
//             change.operationType === 'update' &&
//             change.documentKey._id &&
//             change.updateDescription.updatedFields.hasOwnProperty('winner')
//         ) {
//             console.log("winner closed");
//             const room = await PokerRoom.findOne({ _id: change.documentKey._id });
//             if (room.roomId === roomId && room.winner !== null) {
//                 await pokerRoomsChangeStream.close();
//             }
//         }
//     });
// };

const handlePlayerTurnTimeout = async (room, roomId, io, userId) => {
    let playerTurnChanged = false;

    // Set a timeout for 10 seconds
    const timeout = setTimeout(async () => {
        if (!playerTurnChanged) {
			await pokerRoomsChangeStream.close();
			setTimeout(async () => {
				await playPlayersTurn(room, userId, io); // Make the move on behalf of the player
			}, 1000)
			return
        }
    }, 10000);

    // Listen for any further changes in playersTurn
    const pokerRoomsChangeStream = PokerRoom.watch();

    pokerRoomsChangeStream.on('change', async (change) => {
        if (
            change.operationType === 'update' &&
            change.documentKey._id &&
            change.updateDescription.updatedFields.hasOwnProperty('playersTurn')
        ) {
            const updatedRoom = await PokerRoom.findOne({ _id: change.documentKey._id });

            if (updatedRoom && updatedRoom.roomId === roomId) {
                playerTurnChanged = true;
                clearTimeout(timeout); // Clear the timeout when turn changes
                await pokerRoomsChangeStream.close(); // Close the change stream to prevent memory leak
            }
        }
    });
};

// Play player move based on game round logic
const playPlayersTurn = async (room, userId, io) => {
    if (room.gameRound === 'preflop') {
        await playerFolded(userId, room.roomId, io);
    } else if (room.lastRaise === 0) {
        await checkMove(userId, room.roomId, io);
    } else {
        await playerFolded(userId, room.roomId, io);
    }
};



export const checkWhoIsNext = (room, io) => {
	let index = room.playersData.findIndex((player) => player.userId == room.playersTurn);
	if (room.playersData[index].robot === true) {
		setTimeout(async () => {
			await robotPlays(room, index, io);
		}, 3000);
	} else {
		handlePlayerTurnTimeout(room, room.roomId, io, room.playersTurn);
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
 
export const checkIfAllOut = (userId, room, index) => {
	const remainingPlayers = room.playersData.filter((item) => item.userId !== userId)
	const myPlayers = remainingPlayers.filter((item) => item.userShips > 0 && item.inTheGame)
	if (myPlayers.length == 0)
		return true
  	return false
}

const kickUsers = async (room) => {
	try {
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
	} catch (err) {
		return room
	}
	
}

const createCardsPlayers = (room) => {
	let counter = 0
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
		room.winner = null
		room.lastPlayerMove = null

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
			robot: room.playersData[index].robot,
		}));
	return room
}

const initialGame = (room) => {
	room.playersData[0].bet = 0
	room.playersData[0].inTheGame = true
	room.playersData[0].raised = 0
	room.playersData[0].lastRaise = room.bigBlind
	room.playersData[0].bet = 0
	room.playersData[0].checked = false
	room.playersData[0].currentCards = []
	room.lastRaise = 0
	room.paud = 0
	room.communityCards = []
	room.gameStarted = false
	room.checking = false
	room.gameRound = "preflop"
	room.playersTurn = null,
	room.playersData[0].robot = false,
	room.winner = null,
	room.lastPlayerMove = null
	return room
}





const startTheGame = async (roomId, io) => {
  try {
	let room = await kickUsers(await pokerRoomCollection.findOne({ roomId: roomId }))
    if (room && room.playersData.length >= 2) {
		room = createCardsPlayers(room)
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
        } else 
          room.playersTurn = room.players[2]
		io.to(roomId).emit('startGame');
    } else {
		room = initialGame(room)
	}
	const myNewRoom = await pokerRoomCollection.findOneAndUpdate(
		{ roomId: roomId }, // Filter
		{ $set: room }, // Update
		{ returnDocument: 'after', runValidators: true } // Options
	  );
	checkWhoIsNext(room, io)
	io.to(roomId).emit('updatePlayers', myNewRoom);
  } catch (err) {
    console.error('Error finding the room:', err);
    return err
  }
};

export default startTheGame
