const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");

const uri = "mongodb+srv://nikitanegi1854_db_user:F0uxPZsTeXyVw7nr@cluster0.qaaq2cm.mongodb.net/?appName=Cluster0";

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
  skillOwnerId: { type: String },
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

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to Atlas for seeding...");

    // Create 2 demo students
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    let studentA = await User.findOne({ email: "alex@university.edu" });
    if (!studentA) {
      studentA = await User.create({
        name: "Alex Rivera",
        email: "alex@university.edu",
        password: hashedPassword
      });
      console.log("Created demo student Alex Rivera");
    }

    let studentB = await User.findOne({ email: "sarah@university.edu" });
    if (!studentB) {
      studentB = await User.create({
        name: "Sarah Chen",
        email: "sarah@university.edu",
        password: hashedPassword
      });
      console.log("Created demo student Sarah Chen");
    }

    // Create Skills
    await Skill.deleteMany({});
    const skill1 = await Skill.create({
      name: "Cloud Architecture & Kubernetes",
      description: "Hands-on microservices design, Docker containerization, and Kubernetes cluster orchestration.",
      category: "Cloud Computing",
      userId: studentA._id.toString()
    });

    const skill2 = await Skill.create({
      name: "Full-Stack React & Node.js",
      description: "Building responsive single page applications with state management and REST APIs.",
      category: "Web Development",
      userId: studentB._id.toString()
    });

    const skill3 = await Skill.create({
      name: "Machine Learning & PyTorch",
      description: "Deep neural networks, model training, loss optimization, and computer vision models.",
      category: "Data Science",
      userId: studentA._id.toString()
    });

    console.log("Created 3 demo skills");

    // Create Active Accepted Exchange between Alex and Sarah
    await Exchange.deleteMany({});
    const exchange = await Exchange.create({
      requesterId: studentB._id.toString(),
      skillId: skill1._id.toString(),
      skillOwnerId: studentA._id.toString(),
      message: "Hi Alex! I would love to learn Kubernetes and Cloud Microservices in exchange for React tutoring.",
      status: "accepted",
      rating: 5,
      review: "Fantastic hands-on sessions. Highly recommended!",
      workspace: {
        sessions: [
          {
            date: "Tomorrow, 4:00 PM",
            topic: "Lecture 1: Microservices Architecture & Containerization",
            meetingLink: "https://meet.jit.si/SkillExchange_Cloud_Session_1",
            status: "scheduled"
          },
          {
            date: "Friday, 2:00 PM",
            topic: "Lecture 2: Kubernetes Ingress & Service Discovery",
            meetingLink: "https://meet.jit.si/SkillExchange_Cloud_Session_2",
            status: "scheduled"
          }
        ],
        notes: [
          {
            authorId: studentA._id.toString(),
            authorName: "Alex Rivera",
            content: "Here is the official architecture reference for our Cloud Computing project microservices breakdown.",
            url: "https://kubernetes.io/docs/concepts/overview/",
            timestamp: new Date()
          },
          {
            authorId: studentB._id.toString(),
            authorName: "Sarah Chen",
            content: "Notes from lecture 1: Decoupling services isolates memory failures and enables independent horizontal scaling.",
            url: "",
            timestamp: new Date()
          }
        ],
        assignments: [
          {
            title: "Lab 1: Microservices Container Deployment",
            instructions: "Create a Dockerfile for the User Service and verify that it responds on port 5001 with health status 200.",
            dueDate: "Tomorrow, 11:59 PM",
            submission: "Dockerfile successfully created and verified locally using curl.",
            feedback: "Great job! Docker image layers are clean and lightweight.",
            score: 95,
            status: "completed"
          }
        ],
        quizzes: [
          {
            title: "Cloud Computing Fundamentals Quiz",
            questions: [
              {
                question: "What is the primary benefit of microservices over a monolithic architecture?",
                options: [
                  "Single database file",
                  "Independent scaling and fault isolation",
                  "Faster execution on one CPU",
                  "Elimination of network communication"
                ],
                answer: "Independent scaling and fault isolation"
              },
              {
                question: "Which cloud service model provides managed databases like MongoDB Atlas?",
                options: [
                  "IaaS (Infrastructure as a Service)",
                  "DBaaS (Database as a Service)",
                  "SaaS (Software as a Service)",
                  "FaaS (Function as a Service)"
                ],
                answer: "DBaaS (Database as a Service)"
              }
            ],
            attempts: [
              {
                userId: studentB._id.toString(),
                score: 2,
                total: 2
              }
            ]
          }
        ]
      }
    });

    console.log("Created active exchange with workspace, notes, assignments, and quiz!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();

