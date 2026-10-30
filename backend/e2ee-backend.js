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

const users = []; // in-memory
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

