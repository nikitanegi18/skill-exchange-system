const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|ppt|pptx|png|jpg|jpeg/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error("Invalid file type"));
  }
});

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

let inMemoryExchanges = [
  {
    _id: "demo-exchange-1",
    requesterId: "all-students",
    skillId: "demo-skill-1",
    skillOwnerId: "demo-teacher-alex",
    message: "Welcome to your Cloud Computing Exchange Workspace! Scheduled sessions, notes, quizzes, and assignments are ready.",
    status: "accepted",
    rating: 5,
    review: "Exceptional learning experience!",
    workspace: {
      sessions: [
        { date: "Tomorrow, 4:00 PM", topic: "Lecture 1: Microservices Architecture & Containerization", meetingLink: "https://meet.jit.si/SkillExchange_Cloud_Class", status: "scheduled" },
        { date: "Friday, 2:00 PM", topic: "Lecture 2: Kubernetes Ingress & Service Discovery", meetingLink: "https://meet.jit.si/SkillExchange_Cloud_Class_2", status: "scheduled" }
      ],
      notes: [
        { authorId: "demo-teacher-alex", authorName: "Alex Rivera", content: "Official reference for our Cloud Computing project microservices decomposition.", url: "https://kubernetes.io/docs/concepts/overview/", timestamp: new Date() },
        { authorId: "demo-student-sarah", authorName: "Sarah Chen", content: "Key concept: Decoupling services isolates failures and enables independent horizontal scaling.", url: "", timestamp: new Date() }
      ],
      assignments: [
        { title: "Lab 1: Microservices Container Deployment", instructions: "Create a Dockerfile for the User Service and verify that it responds on port 5001.", dueDate: "Tomorrow, 11:59 PM", submission: "Dockerfile verified locally with curl.", feedback: "Great work! Images are lightweight.", score: 95, status: "completed" }
      ],
      quizzes: [
        {
          title: "Cloud Computing Fundamentals Quiz",
          questions: [
            { question: "What is the primary benefit of microservices over a monolithic architecture?", options: ["Single database file", "Independent scaling and fault isolation", "Faster execution on one CPU", "Elimination of network communication"], answer: "Independent scaling and fault isolation" }
          ],
          attempts: []
        }
      ]
    }
  }
];
let useMongo = true;

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("Exchange Service connected to MongoDB Atlas"))
  .catch((error) => {
    console.log("MongoDB connection failed, falling back to in-memory:", error.message);
    useMongo = false;
  });

app.get("/", (req, res) => res.send("Exchange Service is running!"));

app.post("/exchanges", async (req, res) => {
  try {
    const { requesterId, skillId } = req.body;
    
    // Fetch skill to verify owner
    let skillOwnerId = null;
    try {
      const skillRes = await fetch(`${process.env.SKILL_SERVICE_URL || 'http://localhost:5002'}/skills/${skillId}`);
      if (skillRes.ok) {
        const skill = await skillRes.json();
        skillOwnerId = skill.userId;
      }
    } catch (err) {
      console.log("Could not verify skill owner");
    }

    if (skillOwnerId && requesterId === skillOwnerId) {
      return res.status(400).json({ message: "You cannot request your own skill." });
    }

    // Check for duplicates
    let existing;
    if (!useMongo) {
      existing = inMemoryExchanges.find(e => e.skillId === skillId && e.requesterId === requesterId && e.status === "pending");
    } else {
      existing = await Exchange.findOne({ skillId, requesterId, status: "pending" });
    }
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
    
    if (!ex) return res.status(404).json({message: "Not found"});
    res.status(200).json(ex);
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.patch("/exchanges/:id/status", async (req, res) => {
  try {
    const { status, userId } = req.body;
    let exchange;
    
    if (!useMongo) {
      exchange = inMemoryExchanges.find(e => e._id === req.params.id);
    } else {
      exchange = await Exchange.findById(req.params.id);
    }
    
    if (!exchange) return res.status(404).json({ message: "Not found" });
    
    // Verify that the person accepting/rejecting is the skill owner
    if (userId) {
      let skillOwnerId = exchange.skillOwnerId;
      if (!skillOwnerId) {
        try {
          const skillRes = await fetch(`${process.env.SKILL_SERVICE_URL || 'http://localhost:5002'}/skills/${exchange.skillId}`);
          if (skillRes.ok) {
            const skill = await skillRes.json();
            skillOwnerId = skill.userId;
          }
        } catch (err) {}
      }
      if (skillOwnerId && skillOwnerId !== userId) {
        return res.status(403).json({ message: "Only the skill owner can update the status." });
      }
    }

    if (!useMongo) {
      exchange.status = status;
      return res.status(200).json({ message: "Updated", exchange });
    }
    
    exchange = await Exchange.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ message: "Updated", exchange });
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
  } catch(e) { res.status(500).json({error: e.message}); }
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
  } catch(e) { res.status(500).json({error: e.message}); }
});

app.post("/exchanges/:id/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `http://localhost:5003/uploads/${req.file.filename}`;
  res.status(200).json({ url, filename: req.file.originalname });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Exchange Service running on http://localhost:${PORT}`));
