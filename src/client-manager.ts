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
        socket.on('message', (_message: string) => {
            log(_message);
            try {
                const message: Signal<Object> = JSON.parse(_message);
                if (
                    message.cmd === 'rtc_description' &&
                    message.args &&
                    message.args.length
                ) {
                    const rtcDesc: RTCDescription = <RTCDescription>(
                        message.args[0]
                    );
                    this.description = rtcDesc;
                    cm.emit(ClientManager.event.GOT_RTC_DESC, this);
                    return;
                }
                if (
                    message.cmd === 'candidate' &&
                    message.args &&
                    message.args.length
                ) {
                    const candidate: RTCCandidate = <RTCCandidate>(
                        message.args[0]
                    );
                    this.withPeers.forEach(withPeer => {
                        withPeer.send({
                            cmd: 'candidate',
                            args: [candidate]
                        });
                    });
                }
            } catch (err) {
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
            debugger;
            this.clientCollection.set(client.uuid, client);
            const firstClient = this.clientWithoutPeers.pop();
            if (firstClient && firstClient !== client) {
                client.send({
                    cmd: 'rtc_description',
                    args: [<RTCDescription>firstClient.description]
                });
                client.withPeers.push(firstClient);
                firstClient.withPeers.push(client);
            } else {
                client.send({
                    cmd: 'should_rtc_create_offer',
                    args: []
                });
            }
        });
        this.on(ClientManager.event.GOT_RTC_DESC, (client: Client) => {
            debugger;
            if (client.description && client.description.type === 'offer') {
                this.clientWithoutPeers.push(client);
            } else if (
                client.description &&
                client.description.type === 'answer'
            ) {
                client.withPeers.forEach(withPeer => {
                    withPeer.send({
                        cmd: 'rtc_description',
                        args: [<RTCDescription>client.description]
                    });
                });
            }
        });
    }
    new(socket: Socket) {
        return new Client(socket, this);
    }
    delete(client: Client) {
        this.clientCollection.delete(client.uuid);
        this.clientWithoutPeers = this.clientWithoutPeers.filter(
            _client => _client !== client
        );
        log('delete', this.clientWithoutPeers);
    }
}
