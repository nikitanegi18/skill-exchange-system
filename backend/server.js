const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "PUT", "DELETE"] }
});

// Setup static uploads dir
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_"))
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Database Schemas & Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Skill = mongoose.model("Skill", skillSchema);

const exchangeSchema = new mongoose.Schema({
  requesterId: { type: String, required: true },
  skillId: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "pending" },
  rating: { type: Number, default: 0 },
  review: { type: String, default: "" },
  workspace: {
    sessions: [{ date: String, topic: String, meetingLink: String, status: { type: String, default: "scheduled" } }],
    notes: [{ authorId: String, authorName: String, content: String, url: String, timestamp: { type: Date, default: Date.now } }],
    assignments: [{ title: String, instructions: String, dueDate: String, submission: String, feedback: String, score: Number, status: { type: String, default: "pending" } }],
    quizzes: [{ title: String, questions: [{ question: String, options: [String], answer: String }], attempts: [{ userId: String, score: Number, total: Number }] }]
  }
});
const Exchange = mongoose.model("Exchange", exchangeSchema);

// In-Memory fallbacks if Mongo fails
let inMemoryUsers = [];
let inMemorySkills = [];
let inMemoryExchanges = [];
let useMongo = true;

const mongoUri = process.env.MONGODB_URI || "mongodb+srv://nikitanegi1854_db_user:F0uxPZsTeXyVw7nrno@cluster0.qaaq2cm.mongodb.net/?appName=Cluster0";

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("Connected to MongoDB Atlas successfully!"))
  .catch((err) => {
    console.log("MongoDB connection fallback to in-memory:", err.message);
    useMongo = false;
  });

// --- USER ROUTES ---
app.post("/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });

    if (!useMongo) {
      if (inMemoryUsers.find(u => u.email === email)) return res.status(400).json({ message: "Email already registered" });
      const user = { _id: Date.now().toString(), name, email, password: await bcrypt.hash(password, 10) };
      inMemoryUsers.push(user);
      return res.status(201).json({ message: "Registered (In-Memory)", user: { id: user._id, name, email } });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });
    const user = new User({ name, email, password: await bcrypt.hash(password, 10) });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { res.status(400).json({ message: "Registration failed", error: error.message }); }
});

app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    let user;
    if (!useMongo) user = inMemoryUsers.find(u => u.email === email);
    else user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { res.status(500).json({ message: "Login failed", error: error.message }); }
});

// --- SKILL ROUTES ---
app.get("/skills", async (req, res) => {
  try {
    if (!useMongo) return res.status(200).json(inMemorySkills);
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/skills/:id", async (req, res) => {
  try {
    let skill;
    if (!useMongo) skill = inMemorySkills.find(s => s._id === req.params.id);
    else skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json(skill);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/skills", async (req, res) => {
  try {
    const { name, description, category, userId } = req.body;
    if (!name || !description || !category || !userId) return res.status(400).json({ message: "Missing required fields" });

    if (!useMongo) {
      const skill = { _id: Date.now().toString(), name, description, category, userId, createdAt: new Date() };
      inMemorySkills.push(skill);
      return res.status(201).json({ message: "Skill created (In-Memory)", skill });
    }
    const skill = new Skill({ name, description, category, userId });
    await skill.save();
    res.status(201).json({ message: "Skill created successfully", skill });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.put("/skills/:id", async (req, res) => {
  try {
    const { name, description, category, userId } = req.body;
    let skill;
    if (!useMongo) skill = inMemorySkills.find(s => s._id === req.params.id);
    else skill = await Skill.findById(req.params.id);

    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (userId && skill.userId !== userId) return res.status(403).json({ message: "Unauthorized to edit this skill" });

    if (!useMongo) {
      Object.assign(skill, { name, description, category });
      return res.status(200).json({ message: "Updated (In-Memory)", skill });
    }
    const updated = await Skill.findByIdAndUpdate(req.params.id, { name, description, category }, { new: true });
    res.status(200).json({ message: "Skill updated successfully", skill: updated });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete("/skills/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    let skill;
    if (!useMongo) skill = inMemorySkills.find(s => s._id === req.params.id);
    else skill = await Skill.findById(req.params.id);

    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (userId && skill.userId !== userId) return res.status(403).json({ message: "Unauthorized to delete this skill" });

    if (!useMongo) {
      inMemorySkills = inMemorySkills.filter(s => s._id !== req.params.id);
      return res.status(200).json({ message: "Deleted (In-Memory)" });
    }
    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- EXCHANGE ROUTES ---
app.get("/exchanges", async (req, res) => {
  try {
    if (!useMongo) return res.status(200).json(inMemoryExchanges);
    res.status(200).json(await Exchange.find());
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/exchanges/:id", async (req, res) => {
  try {
    let ex;
    if (!useMongo) ex = inMemoryExchanges.find(e => e._id === req.params.id);
    else ex = await Exchange.findById(req.params.id);
    if (!ex) return res.status(404).json({ message: "Not found" });
    res.status(200).json(ex);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/exchanges", async (req, res) => {
  try {
    const { requesterId, skillId } = req.body;
    
    // Check skill owner
    let skillOwnerId = null;
    let skillObj;
    if (!useMongo) skillObj = inMemorySkills.find(s => s._id === skillId);
    else skillObj = await Skill.findById(skillId);
    if (skillObj) skillOwnerId = skillObj.userId;

    if (skillOwnerId && requesterId === skillOwnerId) {
      return res.status(400).json({ message: "You cannot request your own skill." });
    }

    // Check duplicate
    let existing;
    if (!useMongo) existing = inMemoryExchanges.find(e => e.skillId === skillId && e.requesterId === requesterId && e.status === "pending");
    else existing = await Exchange.findOne({ skillId, requesterId, status: "pending" });

    if (existing) {
      return res.status(400).json({ message: "You already have a pending request for this skill." });
    }

    if (!useMongo) {
      const exchange = { _id: Date.now().toString(), ...req.body, skillOwnerId, workspace: { sessions: [], notes: [], assignments: [], quizzes: [] } };
      inMemoryExchanges.push(exchange);
      return res.status(201).json({ message: "Created (In-Memory)", exchange });
    }
    const exchange = new Exchange({ ...req.body, skillOwnerId, workspace: { sessions: [], notes: [], assignments: [], quizzes: [] } });
    await exchange.save();
    res.status(201).json({ message: "Created", exchange });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.patch("/exchanges/:id/status", async (req, res) => {
  try {
    const { status, userId } = req.body;
    let exchange;
    if (!useMongo) exchange = inMemoryExchanges.find(e => e._id === req.params.id);
    else exchange = await Exchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ message: "Not found" });

    if (userId) {
      let owner = exchange.skillOwnerId;
      if (!owner) {
        let s = useMongo ? await Skill.findById(exchange.skillId) : inMemorySkills.find(x => x._id === exchange.skillId);
        if (s) owner = s.userId;
      }
      if (owner && owner !== userId) return res.status(403).json({ message: "Only the skill owner can update status." });
    }

    if (!useMongo) {
      exchange.status = status;
      return res.status(200).json({ message: "Updated", exchange });
    }
    const updated = await Exchange.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ message: "Updated", exchange: updated });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.patch("/exchanges/:id/workspace", async (req, res) => {
  try {
    if (!useMongo) {
      const exchange = inMemoryExchanges.find(e => e._id === req.params.id);
      if (!exchange) return res.status(404).json({ message: "Not found" });
      exchange.workspace = req.body.workspace;
      return res.status(200).json(exchange);
    }
    const exchange = await Exchange.findByIdAndUpdate(req.params.id, { $set: { workspace: req.body.workspace } }, { new: true });
    res.status(200).json(exchange);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch("/exchanges/:id/rate", async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!useMongo) {
      const exchange = inMemoryExchanges.find(e => e._id === req.params.id);
      if (!exchange) return res.status(404).json({ message: "Not found" });
      exchange.rating = rating;
      exchange.review = review;
      return res.status(200).json(exchange);
    }
    const exchange = await Exchange.findByIdAndUpdate(req.params.id, { $set: { rating, review } }, { new: true });
    res.status(200).json(exchange);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/exchanges/:id/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.status(200).json({ url, filename: req.file.originalname });
});

// --- E2EE MESSAGING API & SOCKET.IO ---
const chatUsers = [];
const chatMessages = [];
const socketMap = {};

app.post("/api/users", (req, res) => {
  const { username, publicKey } = req.body;
  let user = chatUsers.find(u => u.username === username);
  if (!user) {
    user = { userId: Date.now().toString(), username, publicKey };
    chatUsers.push(user);
  }
  res.json({ userId: user.userId });
});

app.get("/api/users/find/:username", (req, res) => {
  const user = chatUsers.find(u => u.username === req.params.username);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ userId: user.userId, publicKey: user.publicKey });
});

app.get("/api/messages/:userId/:peerId", (req, res) => {
  const { userId, peerId } = req.params;
  const hist = chatMessages.filter(m => 
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
    chatMessages.push(msg);
    const receiverSocket = socketMap[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_encrypted_message", msg);
    }
  });
});

// --- SERVE COMPILED FRONTEND FOR PRODUCTION ---
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Unified Skill Exchange Platform running on port ${PORT}`);
});
