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
router.get('/getUserInfos', checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield collection.findOne({ _id: req.userId }).then((response) => {
        if (!response)
            res.status(400).send("didn't find the user");
        else {
            res.status(200).send(response);
        }
    }).catch((err) => {
        res.status(500).send("Internal server Error");
    });
}));
router.patch("/updateUserInfos", checkToken_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, fullName, avatar64 } = req.body;
    yield Users_js_1.default.findByIdAndUpdate(req.userId, {
        $set: { username, email, fullName, avatar64 }
    }, { new: true, runValidators: true }).then((response) => {
        if (!response)
            res.status(400).send("didn't find the user");
        else {
            res.status(200).send(response);
        }
    }).catch((err) => {
        res.status(500).send("Internal server Error");
    });
}));
exports.default = router;
