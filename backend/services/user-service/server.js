const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

let inMemoryUsers = [];
let useMongo = true;

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("User Service connected to MongoDB Atlas"))
  .catch((error) => {
    console.log("MongoDB connection failed, falling back to in-memory:", error.message);
    useMongo = false;
  });

app.get("/", (req, res) => res.send("User Service is running!"));

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
    if (!useMongo) {
      user = inMemoryUsers.find(u => u.email === email);
    } else {
      user = await User.findOne({ email });
    }

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { res.status(500).json({ message: "Login failed", error: error.message }); }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`User Service running on http://localhost:${PORT}`));
