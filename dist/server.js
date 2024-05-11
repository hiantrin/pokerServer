"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const createUser_js_1 = __importDefault(require("./routes/createUser.js"));
const getUserInfos_js_1 = __importDefault(require("./routes/getUserInfos.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const buyFromStore_js_1 = __importDefault(require("./routes/buyFromStore.js"));
const createTable_js_1 = __importDefault(require("./routes/createTable.js"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    }
});
mongoose_1.default.connect(process.env.MONGO_URL);
const db = mongoose_1.default.connection;
db.on('error', (error) => console.error("database error", error));
db.once('open', () => console.log('connected to Database'));
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use('/user', createUser_js_1.default, getUserInfos_js_1.default);
app.use('/store', buyFromStore_js_1.default);
app.use('/pokerGame', createTable_js_1.default);
io.on('connection', (socket) => {
    // Handle 'login' event
    socket.on('login', () => {
        socket.broadcast.emit('updatePlayers');
    });
});
app.get("/", (req, res) => {
    res.send('hamza learning node js and express');
});
server.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    }
    else {
        console.log("Server started on port:", `http://localhost:${PORT}`);
    }
});
