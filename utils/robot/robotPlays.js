import { playerFolded } from "../playerMoves/fold.js";
import { hasStraight } from "./hasStraight.js";
import { checkMove } from "../playerMoves/check.js";
import { allIn } from "../playerMoves/allIn.js";
import { callLastRaise } from "../playerMoves/call.js";
import { raiseAction } from "../playerMoves/raise.js";

const makeItFollow = async (room, io, index) => {
    if (room.checked == true)
        await checkMove(room.playersTurn, room.roomId, io)
    else if (room.lastRaise >= room.playersData[index].userShips)
        await allIn(room.playersTurn, room.roomId, io)
    else
        callLastRaise(room.playersTurn, room.roomId, io)
}

const robotPlays = async (room, index, io) => {
    const allTheWay = hasStraight(room.communityCards, room.playersData[index].currentCards)
    if (allTheWay)
        await makeItFollow(room, io, index)
    else {
        if (room.checking == true)
            await checkMove(room.playersTurn, room.roomId, io)
        else if (room.lastRaise >= room.playersData[index].userShips / 4)
            await playerFolded(room.playersTurn, room.roomId, io)
        else if (room.gameRound !== "river")
            await callLastRaise(room.playersTurn, room.roomId, io)
        else if (room.gameRound == "river" && room.checked == true)
            await raiseAction(room.playersTurn, room.bigBlind, io, "raise")
        else
            await callLastRaise(room.playersTurn, room.roomId, io)
    }
    return
}

export default robotPlays