import mongoose from "mongoose";

const db = mongoose.connection

const pokerRoomCollection = db.collection("pokerrooms")

const createNode = (user) => {
    const node = {
        userId : user._id,
        currentCards: null,
        currentTextEmoji : "",
        userShips: 1000,
        avatar: user.avatar,
        avatar64: user.avatar64,
    }
    return node
}

const createTable = async (value, userId, persons, user) => {
    try {
        const roomId = uuidv4()
        const players = [userId]
        const room = new PokerRoom({
            roomId,
            maxPlayers : persons,
            buyIn : 200000,
            players,
            full: false,
            playersData: [createNode(user)],
            gameStarted: false,
        })
        const response = await room.save()
        return response.roomId
    } catch (err) {
        console.log(err)
        return null
    }
}

const leaveTheGame = async (roomId) => {
    
    try {
        await pokerRoomCollection.findOneAndUpdate({roomId: roomId}, {
            $set : {gameStarted: false}
          }, { returnDocument: 'after', runValidators: true })
    } catch {
        console.error('Error starting the game:', error);
    }
}

export default leaveTheGame