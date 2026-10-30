const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const users = [
  { userId: "demo-alex-1", username: "Alex Rivera", publicKey: "4a2b9c8d7e6f5a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b" },
  { userId: "demo-sarah-1", username: "Sarah Chen", publicKey: "1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e" }
]; // preloaded demo peers
const messages = []; // in-memory
const socketMap = {};

app.post("/api/users", (req, res) => {
  const { username, publicKey } = req.body;
  let user = users.find(u => u.username === username);
  if (!user) {
    user = { userId: Date.now().toString(), username, publicKey };
    users.push(user);
  }
  res.json({ userId: user.userId });
});

app.get("/api/users/find/:username", (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ userId: user.userId, publicKey: user.publicKey });
});

app.get("/api/messages/:userId/:peerId", (req, res) => {
  const { userId, peerId } = req.params;
  const hist = messages.filter(m => 
    (m.senderId === userId && m.receiverId === peerId) || 
    (m.senderId === peerId && m.receiverId === userId)
  );
  res.json(hist);
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socketMap[userId] = socket.id;
  });
  socket.on("send_encrypted_message", (data) => {
    const { senderId, receiverId, encryptedPayload } = data;
    const msg = { _id: Date.now().toString(), senderId, receiverId, encryptedPayload, timestamp: new Date().toISOString() };
    messages.push(msg);
    const receiverSocket = socketMap[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_encrypted_message", msg);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`E2EE Server running on port ${PORT}`);
});

