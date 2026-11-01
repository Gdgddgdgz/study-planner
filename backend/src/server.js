import express from "express";
import { ENV } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const PORT = ENV.PORT;

// Serve public uploads statically for fallback
app.use(express.static("public"));

// Basic CORS headers to allow requests from Vite frontend
app.use((req, res, next) => {
  const allowedOrigin = ENV.FRONTEND_URL;
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authRoutes); // supports both /api/auth and /api/user prefixes
app.use("/auth", authRoutes);
app.use("/user", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running smoothly" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
