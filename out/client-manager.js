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
        socket.on('message', (_message) => {
            log(_message);
            try {
                const message = JSON.parse(_message);
                if (message.cmd === 'rtc_description' &&
                    message.args &&
                    message.args.length) {
                    const rtcDesc = (message.args[0]);
                    this.description = rtcDesc;
                    cm.emit(ClientManager.event.GOT_RTC_DESC, this);
                    return;
                }
                if (message.cmd === 'candidate' &&
                    message.args &&
                    message.args.length) {
                    const candidate = (message.args[0]);
                    this.withPeers.forEach(withPeer => {
                        withPeer.send({
                            cmd: 'candidate',
                            args: [candidate]
                        });
                    });
                }
            }
            catch (err) {
                console.log(err);
            }
        });
        socket.on('error', err => {
            console.error(err);
            socket.close();
        });
        socket.on('close', () => {
            log('socket.close');
            this.cm.delete(this);
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
            debugger;
            this.clientCollection.set(client.uuid, client);
            const firstClient = this.clientWithoutPeers.pop();
            if (firstClient && firstClient !== client) {
                client.send({
                    cmd: 'rtc_description',
                    args: [firstClient.description]
                });
                client.withPeers.push(firstClient);
                firstClient.withPeers.push(client);
            }
            else {
                client.send({
                    cmd: 'should_rtc_create_offer',
                    args: []
                });
            }
        });
        this.on(ClientManager.event.GOT_RTC_DESC, (client) => {
            debugger;
            if (client.description && client.description.type === 'offer') {
                this.clientWithoutPeers.push(client);
            }
            else if (client.description &&
                client.description.type === 'answer') {
                client.withPeers.forEach(withPeer => {
                    withPeer.send({
                        cmd: 'rtc_description',
                        args: [client.description]
                    });
                });
            }
        });
    }
    new(socket) {
        return new Client(socket, this);
    }
    delete(client) {
        this.clientCollection.delete(client.uuid);
        this.clientWithoutPeers = this.clientWithoutPeers.filter(_client => _client !== client);
        log('delete', this.clientWithoutPeers);
    }
}
ClientManager.event = {
    NEW_CLIENT_CONN: v4_1.default(),
    GOT_RTC_DESC: v4_1.default()
};
exports.ClientManager = ClientManager;
//# sourceMappingURL=client-manager.js.map