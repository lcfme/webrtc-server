/// <reference path="./typings.ts" />
import { EventEmitter } from 'events';
import uuid from 'uuid/v4';
import Socket from 'ws';

const log = console.log.bind(console);

export class Client {
    socket: Socket;
    withPeers: Array<Client>;
    uuid: string;
    description: RTCDescription | void;
    cm: ClientManager;
    constructor(socket: Socket, cm: ClientManager) {
        this.socket = socket;
        this.withPeers = [];
        this.uuid = uuid();
        this.description = undefined;
        this.cm = cm;
        cm.emit(ClientManager.event.NEW_CLIENT_CONN, this);
        socket.on('message', (message: Signal<Object>) => {
            log(message);
            if (
                message.cmd === 'rtc_description' &&
                message.args &&
                message.args.length
            ) {
                const rtcDesc: RTCDescription = <RTCDescription>message.args[0];
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
    send(signal: Signal<Object>) {
        this.socket.send(JSON.stringify(signal));
    }
}

export class ClientManager extends EventEmitter {
    static event = {
        NEW_CLIENT_CONN: uuid(),
        GOT_RTC_DESC: uuid()
    };
    clientCollection: Map<string, Client>;
    clientWithoutPeers: Array<Client>;
    constructor() {
        super();
        this.clientCollection = new Map();
        this.clientWithoutPeers = [];
        this.on(ClientManager.event.NEW_CLIENT_CONN, (client: Client) => {
            this.clientCollection.set(client.uuid, client);
        });
        this.on(ClientManager.event.GOT_RTC_DESC, (client: Client) => {
            this.clientWithoutPeers.push(client);
            const firstClient = this.clientWithoutPeers[0];
            if (firstClient && firstClient !== client) {
                client.send({
                    cmd: 'rtc_description',
                    args: [<RTCDescription>firstClient.description]
                });
                firstClient.send({
                    cmd: 'rtc_description',
                    args: [<RTCDescription>firstClient.description]
                });
            }
        });
    }
    new(socket: Socket) {
        return new Client(socket, this);
    }
}
