import WebSocket from 'ws';
import { ClientManager } from './client-manager';

const server = new WebSocket.Server({
    port: 8888
});

server.on('connection', (socket, request) => {});

server.on('error', err => {
    console.error(err);
    process.exit(1);
});
