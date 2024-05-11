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
Object.defineProperty(exports, "__esModule", { value: true });
const checkUser = (collection) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (((_a = req.body) === null || _a === void 0 ? void 0 : _a.id) && ((_b = req.body) === null || _b === void 0 ? void 0 : _b.username) && ((_c = req.body) === null || _c === void 0 ? void 0 : _c.userType) && ((_d = req.body) === null || _d === void 0 ? void 0 : _d.userType) == "google") {
            try {
                const response = yield collection.findOne({ _id: req.body.id });
                if (!response) {
                    next();
                }
                else {
                    res.status(200).send(response.authToken);
                }
            }
            catch (error) {
                res.status(500).send("Internal Server Error");
            }
        }
        else
            res.status(400).send("informations required");
    });
};
exports.default = checkUser;
