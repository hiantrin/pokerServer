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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_js_1 = __importDefault(require("../models/Users.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const checkUser_js_1 = __importDefault(require("../middlewares/checkUser.js"));
const router = express_1.default.Router();
const db = mongoose_1.default.connection;
const collection = db.collection('users');
const uuid_1 = require("uuid");
const checkUsername_js_1 = __importDefault(require("../middlewares/checkUsername.js"));
const generateRandomUsername = (inputUsername) => {
    const randomNumber = Math.floor(Math.random() * 100000);
    const randomUsername = inputUsername + '_' + randomNumber.toString().padStart(5, '0');
    return randomUsername;
};
const createTheUser = (infos, req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myId = (infos === null || infos === void 0 ? void 0 : infos.id) && infos.userType !== "guest" ? infos.id : (0, uuid_1.v4)();
        const randomUsername = generateRandomUsername(infos.username);
        const token = jsonwebtoken_1.default.sign(myId, process.env.ACCESS_TOKEN_SECRET);
        const user = new Users_js_1.default({
            username: randomUsername,
            userType: infos.userType,
            authToken: token,
            avatar: (infos === null || infos === void 0 ? void 0 : infos.profile) ? infos.profile : null,
            email: (infos === null || infos === void 0 ? void 0 : infos.email) ? infos.email : null,
            fullName: (infos === null || infos === void 0 ? void 0 : infos.fullName) ? infos.fullName : null,
            _id: myId,
        });
        const response = yield user.save();
        return { error: false, authToken: response.authToken };
    }
    catch (err) {
        return { error: true };
    }
});
router.post('/createUser', checkUsername_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield createTheUser(req.body, req);
    if (result.error) {
        res.status(500).send("Database error");
    }
    else {
        res.status(200).send(result.authToken);
    }
}));
router.post('/createUserGoogle', (0, checkUser_js_1.default)(collection), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield createTheUser(req.body, req);
    if (result.error) {
        res.status(500).send("Database error");
    }
    else {
        res.status(200).send(result.authToken);
    }
}));
exports.default = router;
