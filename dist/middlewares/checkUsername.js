"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkUsername = (req, res, next) => {
    var _a, _b, _c;
    if (((_a = req.body) === null || _a === void 0 ? void 0 : _a.username) && ((_b = req.body) === null || _b === void 0 ? void 0 : _b.userType) && ((_c = req.body) === null || _c === void 0 ? void 0 : _c.userType) == "guest") {
        next();
    }
    else {
        res.status(400).send("informations required");
        return;
    }
};
exports.default = checkUsername;
