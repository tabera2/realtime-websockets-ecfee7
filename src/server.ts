import { WebSocketServer, WebSocket } from 'ws';
import { ServerMessage } from './protocol';
import { parseClientMessage } from './parse';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<WebSocket>();

// We tag each socket with an "isAlive" flag for the heartbeat sweep.
type LiveSocket = WebSocket & { isAlive?: boolean };

wss.on('connection', (socket: LiveSocket) => {
  clients.add(socket);
  socket.isAlive = true;
  // pong arrives in reply to our ping — proof the socket is still live.
  socket.on('pong', () => { socket.isAlive = true; });
  console.log('client connected:', clients.size);

  socket.on('message', (raw) => {
    const msg = parseClientMessage(raw.toString());
    if (!msg) return; // drop anything that doesn't validate
    if (msg.type === 'command') {
      console.log(`command ${msg.action} → ${msg.robotId}`);
      // (here you'd forward the command to the robot)
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

// Every 30s: terminate any socket that didn't pong since the last sweep.
const heartbeat = setInterval(() => {
  for (const c of clients as Set<LiveSocket>) {
    if (c.isAlive === false) {
      clients.delete(c);
      c.terminate(); // hard close — it's already dead
      continue;
    }
    c.isAlive = false; // expect a pong before the next sweep
    c.ping();
  }
}, 30_000);

wss.on('close', () => clearInterval(heartbeat));

// Push a message to every connected client.
function broadcast(msg: ServerMessage) {
  const data = JSON.stringify(msg);
  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  }
}

// Simulate telemetry streaming at 10 Hz.
setInterval(() => {
  broadcast({ type: 'telemetry', robotId: 'r1', battery: 80, x: Math.random(), y: Math.random(), ts: Date.now() });
}, 100);
