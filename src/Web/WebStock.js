const WebSocket = require("ws");

const connectionMap = new Map(); // <ws, machine_id>
const machineStatusMap = new Map(); // <machine_id, { ws, lastPing }>

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", (message) => {
      const msgStr = message.toString();
      try {
        const parsed = JSON.parse(msgStr);
        console.log("Received:", parsed);

        if (parsed.machine_id) {
          const machine_id = parsed.machine_id;

          // Save mapping and update lastPing
          connectionMap.set(ws, machine_id);
          machineStatusMap.set(machine_id, {
            ws,
            lastPing: Date.now(),
          });

          // Broadcast the message (e.g. online or ping)
          broadcast(wss, parsed);
        }
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      // const machine_id = connectionMap.get(ws);
      // if (machine_id) {
      //   console.log(`WebSocket closed: ${machine_id}`);
      //   broadcast(wss, { machine_id, status: "offline" });

      //   connectionMap.delete(ws);
      //   machineStatusMap.delete(machine_id);
      // }
    });

    // Optional welcome message
    ws.send(JSON.stringify({ message: "Welcome" }));
  });

  // Periodically check for dead connections
  setInterval(() => {
    const now = Date.now();
    const timeout = 10000; // 15 seconds

    for (const [machine_id, { lastPing, ws }] of machineStatusMap.entries()) {
      if (now - lastPing > timeout) {
        console.log(`Machine ${machine_id} is offline (timeout)`);
        broadcast(wss, { machine_id, status: "offline" });

        machineStatusMap.delete(machine_id);
        connectionMap.delete(ws);
      }
    }
  }, 5000);

  function broadcast(wss, message) {
    const json = JSON.stringify(message);
    console.log("Broadcast:", json);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  }
}

module.exports = startWebSocketServer;
