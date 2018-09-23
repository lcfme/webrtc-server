/// <reference path="typings.d.ts" />
/// <reference types="ws" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import Socket from 'ws';
export declare class Client {
    socket: Socket;
    withPeers: Array<Client>;
    uuid: string;
    description: RTCDescription | void;
    cm: ClientManager;
    constructor(socket: Socket, cm: ClientManager);
    send(signal: Signal<Object>): void;
}
export declare class ClientManager extends EventEmitter {
    static event: {
        NEW_CLIENT_CONN: string;
        GOT_RTC_DESC: string;
    };
    clientCollection: Map<string, Client>;
    clientWithoutPeers: Array<Client>;
    constructor();
    new(socket: Socket): Client;
    delete(client: Client): void;
}
