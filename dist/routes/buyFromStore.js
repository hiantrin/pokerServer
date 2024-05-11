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
const Users_js_1 = __importDefault(require("../models/Users.js"));
const router = express_1.default.Router();
const db = mongoose_1.default.connection;
const collection = db.collection('users');
const getShipsNumber = (gold) => {
    if (gold == 1)
        return 1000;
    if (gold == 20)
        return 30000;
    if (gold == 60)
        return 100000;
    if (gold == 180)
        return 300000;
    if (gold == 300)
        return 500000;
    if (gold == 600)
        return 1200000;
};
router.patch("/buyShips", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield collection.findOne({ _id: req.userId }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
        if (response.gold >= req.body.gold) {
            const ships = getShipsNumber(req.body.gold);
            yield Users_js_1.default.findByIdAndUpdate(req.userId, {
                $set: { gold: response.gold - req.body.gold, ships: ships + response.ships }
            }, { new: true, runValidators: true })
                .then((response) => {
                if (!response)
                    res.status(400).send("didn't find the user");
                else {
                    res.status(200).send(response);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send("Internal server Error");
            });
        }
        else {
            res.status(400).send("not enough money");
        }
    })).catch((err) => {
        console.log(err);
        res.status(500).send("Internal server Error");
    });
}));
router.get("/bonus", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield collection.findOne({ _id: req.userId }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
        if (response.firstLogin == true) {
            yield Users_js_1.default.findByIdAndUpdate(req.userId, {
                $set: { firstLogin: false, ships: 1000 + response.ships }
            }, { new: true, runValidators: true })
                .then((response) => {
                if (!response)
                    res.status(400).send("didn't find the user");
                else {
                    res.status(200).send(response);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send("Internal server Error");
            });
        }
        else
            res.status(300).send("not first time");
    })).catch((err) => {
        console.log(err);
        res.status(500).send("Internal server Error");
    });
}));
exports.default = router;
