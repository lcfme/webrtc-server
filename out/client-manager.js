"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./typings.ts" />
const events_1 = require("events");
const v4_1 = __importDefault(require("uuid/v4"));
const log = console.log.bind(console);
class Client {
    constructor(socket, cm) {
        this.socket = socket;
        this.withPeers = [];
        this.uuid = v4_1.default();
        this.description = undefined;
        this.cm = cm;
        cm.emit(ClientManager.event.NEW_CLIENT_CONN, this);
        socket.on('message', (message) => {
            log(message);
            if (message.cmd === 'rtc_description' &&
                message.args &&
                message.args.length) {
                const rtcDesc = message.args[0];
                this.description = rtcDesc;
                cm.emit(ClientManager.event.GOT_RTC_DESC, this);
            }
        });
        socket.on('error', err => {
            console.error(err);
            socket.close();
        });
        socket.on('close', () => {
            log('socket.close');
            socket.terminate();
        });
    }
    send(signal) {
        this.socket.send(JSON.stringify(signal));
    }
}
exports.Client = Client;
class ClientManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.clientCollection = new Map();
        this.clientWithoutPeers = [];
        this.on(ClientManager.event.NEW_CLIENT_CONN, (client) => {
            this.clientCollection.set(client.uuid, client);
        });
        this.on(ClientManager.event.GOT_RTC_DESC, (client) => {
            this.clientWithoutPeers.push(client);
            const firstClient = this.clientWithoutPeers[0];
            if (firstClient && firstClient !== client) {
                client.send({
                    cmd: 'rtc_description',
                    args: [firstClient.description]
                });
                firstClient.send({
                    cmd: 'rtc_description',
                    args: [firstClient.description]
                });
            }
        });
    }
    new(socket) {
        return new Client(socket, this);
    }
}
ClientManager.event = {
    NEW_CLIENT_CONN: v4_1.default(),
    GOT_RTC_DESC: v4_1.default()
};
exports.ClientManager = ClientManager;
//# sourceMappingURL=client-manager.js.map