import WebSocket from 'ws';
import { ClientManager } from './client-manager';

const cm = new ClientManager();
const server = new WebSocket.Server({
    port: 8888
});

server.on('connection', (socket, request) => {
    cm.new(socket);
});

server.on('error', err => {
    console.error(err);
    process.exit(1);
});
