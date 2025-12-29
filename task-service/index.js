// Import required packages
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const amqp = require("amqplib")

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

let channel, connection

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqp.connect("amqp://rabbitmq")
      channel = await connection.createChannel()
      await channel.assertQueue("task_created")
      console.log("Connected to RabbitMQ")
      return
    } catch (error) {
      console.error("RabbitMQ Connection Error: ", error)
      retries--
      console.error("Retrying again, Retries Left: ", retries)
      await new Promise((res) => setTimeout(res, delay))
    }
  }
}

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

    const message = { taskId: task._id, userId, title }

    if (!channel) {
      return res.status(503).json({ error: "RabbitMQ Connection not made." })
    }

    channel.sendToQueue("task_created", Buffer.from(JSON.stringify(message)))

    res.status(201).json(task)
  } catch (error) {
    console.error("Error saving task:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Start server
app.listen(port, () => {
  console.log(`Task Service running on port ${port}`)
  connectRabbitMQWithRetry()
})
