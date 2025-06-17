const express = require("express");
const http = require("http");
const path = require("path");
const startWebSocketServer = require("./src/Web/WebStock");

const app = express();
const server = http.createServer(app);

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, "public")));

// Start WebSocket on the same HTTP server
startWebSocketServer(server);
// GeneralWebSocketServer(server);

// Use dynamic port provided by Render
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server running on port : ws://192.168.43.222:${PORT}`);
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
