// Import required packages
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

// Initialize Express app
const app = express()
const port = 3001

// Parse incoming JSON requests
app.use(bodyParser.json())

// ❌ Local MongoDB (used without Docker)
// mongoose
//   .connect("mongodb://localhost:27017/users")

// ✅ MongoDB connection using Docker service name
mongoose
  .connect("mongodb://mongo:27017/users")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection error:", err))

// User schema definition
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
})

// User model
const User = mongoose.model("User", UserSchema)

// Get all users
app.get("/users", async (req, res) => {
  const users = await User.find()
  res.json(users)
})

// Create a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body

  try {
    const user = new User({ name, email })
    await user.save()
    res.status(201).json(user)
  } catch (error) {
    console.error("Error saving user:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Health check route
app.get("/", (req, res) => {
  res.send("Hello World")
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
