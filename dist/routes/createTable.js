"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const checkToken_js_1 = __importDefault(require("../middlewares/checkToken.js"));
const uuid_1 = require("uuid");
const PokerRooms_js_1 = __importDefault(require("../models/PokerRooms.js"));
const Users_js_1 = __importDefault(require("../models/Users.js"));
const router = express_1.default.Router();
const db = mongoose_1.default.connection;
const collection = db.collection('users');
const pokerRoomCollection = db.collection("pokerrooms");
const createTable = (value, userId, persons) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = (0, uuid_1.v4)();
        const players = [userId];
        const room = new PokerRooms_js_1.default({
            roomId,
            maxPlayers: persons,
            buyIn: 200000,
            players,
            full: false
        });
        const response = yield room.save();
        return response.roomId;
    }
    catch (err) {
        return null;
    }
});
router.patch("/quitTable", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_js_1.default.findByIdAndUpdate(req.userId, {
            $set: { roomId: null }
        }, { new: true, runValidators: true });
        if (!user)
            return res.status(400).send("user not found");
        const room = yield pokerRoomCollection.findOne({ roomId: req.body.roomId });
        if (!room)
            return res.status(400).send("didn't find room");
        const newRoom = yield pokerRoomCollection.findOneAndUpdate({ roomId: room.roomId }, {
            $set: { players: room.players.filter(item => item != req.userId), full: false }
        }, { new: true, runValidators: true });
        if (!newRoom)
            return res.status(400).send("room not found");
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send("Internal server Error");
    }
}));
router.get("/getPlayersInfos", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield Users_js_1.default.find({ roomId: req.query.roomId });
        if (!players)
            return res.status(400).send("there is an error in the room");
        res.status(200).send(players);
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Internal server Error");
    }
}));
router.get("/joinRoom", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield pokerRoomCollection.findOne({ roomId: req.query.roomId });
        if (!room)
            return res.status(400).send("didn't find room");
        else if (room.full)
            return res.status(300).send("room is full");
        else if (!room.players.includes(req.userId))
            room.players.push(req.userId);
        const newRoom = yield pokerRoomCollection.findOneAndUpdate({ roomId: room.roomId }, {
            $set: { players: room.players, full: room.players.length == room.players.maxPlayers ? true : false }
        }, { new: true, runValidators: true });
        if (!newRoom)
            return res.status(400).send("sorry can't join room right now");
        const user = yield Users_js_1.default.findByIdAndUpdate(req.userId, {
            $set: { roomId: newRoom.roomId }
        }, { new: true, runValidators: true });
        if (!user)
            return res.status(400).send("didn't find the user");
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send("Internal server error");
    }
}));
router.get("/getTableInfos", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield pokerRoomCollection.findOne({ roomId: req.query.roomId }).then((response) => {
        res.status(200).send(response);
    }).catch((err) => {
        res.status(400).send("didn't find the room");
    });
}));
router.post("/createTable", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { value, persons } = req.body;
    if (!persons || value < 0 || value > 8 || (persons != 4 && persons != 6))
        return res.status(405).send("check your Informations");
    try {
        const user = yield collection.findOne({ _id: req.userId });
        if (!user) {
            return res.status(405).send('User not found');
        }
        const roomId = yield createTable(value, req.userId, persons);
        if (!roomId) {
            return res.status(500).send('Error creating room');
        }
        const userRoom = yield Users_js_1.default.findByIdAndUpdate(req.userId, {
            $set: { roomId: roomId }
        }, { new: true, runValidators: true });
        if (!userRoom) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(userRoom);
    }
    catch (err) {
        console.error('Internal server error:', err);
        res.status(500).send('Internal server error');
    }
}));
exports.default = router;
