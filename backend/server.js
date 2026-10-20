const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// Define Task Schema & Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

// --- FULL CRUD ROUTES ---

// 1. CREATE: Add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }
    const newTask = new Task({ 
      title: title.trim(), 
      description: description || "" 
    });
    const savedTask = await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: savedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. READ: Fetch all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE: Edit a task or toggle completion status
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE: Remove a task permanently
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`TaskFlow server running at http://localhost:${PORT}`);
});