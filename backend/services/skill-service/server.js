const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: String, required: true }
});
const Skill = mongoose.model("Skill", skillSchema);

let inMemorySkills = [];
let useMongo = true;

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("Skill Service connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("MongoDB connection failed, falling back to in-memory:", err.message);
    useMongo = false;
  });

app.get("/", (req, res) => res.send("Skill Service is running!"));

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
  } catch (error) { res.status(500).json({ message: "Failed to create skill", error: error.message }); }
});

app.get("/skills", async (req, res) => {
  try {
    if (!useMongo) {
      return res.status(200).json(inMemorySkills.sort((a, b) => b.createdAt - a.createdAt));
    }
    const skills = await Skill.find().sort({ createdAt: -1 });
    res.status(200).json(skills);
  } catch (error) { res.status(500).json({ message: "Failed to retrieve skills", error: error.message }); }
});

app.get("/skills/:id", async (req, res) => {
  try {
    if (!useMongo) {
      const skill = inMemorySkills.find(s => s._id === req.params.id);
      if (!skill) return res.status(404).json({ message: "Skill not found" });
      return res.status(200).json(skill);
    }
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json(skill);
  } catch (error) { res.status(500).json({ message: "Failed to retrieve skill", error: error.message }); }
});

app.delete("/skills/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    if (!useMongo) {
      const skill = inMemorySkills.find(s => s._id === req.params.id);
      if (!skill) return res.status(404).json({ message: "Skill not found" });
      if (skill.userId !== userId) return res.status(403).json({ message: "You can only delete your own skills" });
      
      inMemorySkills = inMemorySkills.filter(s => s._id !== req.params.id);
      return res.status(200).json({ message: "Skill deleted" });
    }
    
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (skill.userId !== userId) return res.status(403).json({ message: "You can only delete your own skills" });
    
    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) { res.status(500).json({ message: "Failed to delete skill", error: error.message }); }
});

app.put("/skills/:id", async (req, res) => {
  try {
    const { name, description, category, userId } = req.body;
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    if (!useMongo) {
      const skill = inMemorySkills.find(s => s._id === req.params.id);
      if (!skill) return res.status(404).json({ message: "Skill not found" });
      if (skill.userId !== userId) return res.status(403).json({ message: "You can only edit your own skills" });

      Object.assign(skill, { name, description, category });
      return res.status(200).json({ message: "Skill updated", skill });
    }
    
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (skill.userId !== userId) return res.status(403).json({ message: "You can only edit your own skills" });

    await Skill.findByIdAndUpdate(req.params.id, { name, description, category }, { new: true });
    res.status(200).json({ message: "Skill updated successfully", skill });
  } catch (error) { res.status(500).json({ message: "Failed to update skill", error: error.message }); }
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Skill Service running on http://localhost:${PORT}`));
