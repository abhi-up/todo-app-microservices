// Import required packages
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

// Initialize Express app
const app = express()
const port = 3002

// Parse incoming JSON requests
app.use(bodyParser.json())

// ❌ Local MongoDB (used without Docker)
// mongoose
//   .connect("mongodb://localhost:27017/tasks")

// ✅ MongoDB connection using Docker service name
mongoose
  .connect("mongodb://mongo:27017/tasks")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection error:", err))

// Task schema definition
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Task model
const Task = mongoose.model("Task", TaskSchema)

// Get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find()
  res.json(tasks)
})

// Create a new task
app.post("/tasks", async (req, res) => {
  const { title, description, userId } = req.body

  try {
    const task = new Task({ title, description, userId })
    await task.save()
    res.status(201).json(task)
  } catch (error) {
    console.error("Error saving task:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Start server
app.listen(port, () => {
  console.log(`Task Service running on port ${port}`)
})
