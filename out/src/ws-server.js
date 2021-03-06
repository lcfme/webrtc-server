"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const server = new ws_1.default.Server({
    port: 8888
});
server.on('connection', (socket, request) => {
});
server.on('error', err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=ws-server.js.map