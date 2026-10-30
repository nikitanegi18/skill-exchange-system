const mongoose = require('mongoose');
const uri = 'mongodb+srv://nikitanegi1854_db_user:F0uxPZsTeXyVw7nr@cluster0.qaaq2cm.mongodb.net/?appName=Cluster0';

console.log("Testing connection to MongoDB Atlas...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("REAL MONGODB SUCCESS: Connected to MongoDB Atlas successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("MONGO ERR:", err.message);
    process.exit(1);
  });
