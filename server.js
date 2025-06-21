const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const { initializeSocket } = require("./src/config/socket");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

initializeSocket(io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
