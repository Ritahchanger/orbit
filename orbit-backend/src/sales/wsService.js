// services/websocket.service.js
const WebSocket = require("ws");

class WebSocketService {
  constructor() {
    this.clients = new Map(); // clientId -> WebSocket connection
  }
  init(server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const clientId = url.searchParams.get("clientId");
      if (clientId) {
        this.clients.set(clientId, ws);
        console.log(`Client ${clientId} connected`);
      }
      ws.on("close", () => {
        this.clients.delete(clientId);
        console.log(`Client ${clientId} disconnected`);
      });
    });
  }

  // Send message to specific client
  sendToClient(clientId, event, data) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }
  // Broadcast to all clients
  broadcast(event, data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
}

module.exports = new WebSocketService();
