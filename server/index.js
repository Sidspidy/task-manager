require("dotenv").config();
const bcrypt = require("bcrypt");
const config = require("./config.json");
const mongoose = require("mongoose");
mongoose
  .connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Increase timeout
  })
  .then(() => console.log("mongodb connected"));

const User = require("./models/user.model");
const Task = require("./models/task.model");
const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

//Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });
  if (isUser) {
    return res.json({
      error: true,
      message: "User Already Exist",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    return res.json({
      error: true,
      message: "User Not Found",
    });
  }
  const isMatch = await bcrypt.compare(password, userInfo.password);

  if (userInfo.email == email && isMatch) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });
    return res.json({
      error: false,
      email,
      accessToken,
      message: "Login Successful",
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid Credentials",
    });
  }
});

app.get("/user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "User Get successfully",
  });
});

//Add task
app.post("/task/create", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const task = new Task({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await task.save();
    return res.json({
      error: false,
      task,
      message: "Task added successful",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.put("/task/edit/:taskId", authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res.status(400).json({
      error: true,
      message: "No changes provided",
    });
  }
  try {
    const task = await Task.findOne({ _id: taskId, userId: user._id });
    if (!task) {
      return res.status(400).json({ error: false, message: "Task Not Found" });
    }
    if (title) task.title = title;
    if (content) task.content = content;
    if (tags) task.tags = tags;
    if (isPinned) task.isPinned = isPinned;

    await task.save();

    return res.json({
      error: false,
      task,
      message: "Task Updated Succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.get("/task/get", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const tasks = await Task.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      tasks,
      message: "All Tasks retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.delete("/task/delete/:taskId", authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { user } = req.user;
  try {
    const task = await Task.findOne({ _id: taskId, userId: user._id });
    if (!task) {
      return res.status(404).json({ error: false, message: "Task Not Found" });
    }

    await task.deleteOne({ _id: taskId, userId: user._id });

    return res.json({
      error: false,
      message: "Task Delete Succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.put("/task/update-pin/:taskId", authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const task = await Task.findOne({ _id: taskId, userId: user._id });
    if (!task) {
      return res.status(400).json({ error: false, message: "Task Not Found" });
    }
    task.isPinned = isPinned;

    await task.save();

    return res.json({
      error: false,
      task,
      message: "Task Updated Succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.get("/search-tasks", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }
  try {
    const matchingTasks = await Task.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });
    return res.json({
      error: false,
      tasks: matchingTasks,
      message: "Task matching the query retroeved Succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.listen(8000);

module.exports = app;
