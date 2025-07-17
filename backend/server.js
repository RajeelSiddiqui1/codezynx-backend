import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import chatRoutes from "./src/routes/chat.route.js";
import postRoutes from "./src/routes/post.route.js";
import aiRoutes from "./src/routes/ai.route.js";

import { setSocketIOInstance } from "./src/controllers/post.controller.js";
import { connectDB } from "./src/lib/db.js";
import { error } from "console";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://codezynx.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_post", (postId) => {
    socket.join(postId);
    console.log(`User joined room: ${postId}`);
  });

  socket.on("leave_post", (postId) => {
    socket.leave(postId);
    console.log(`User left room: ${postId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

setSocketIOInstance(io);

const __dirname = path.resolve();

app.use(
  cors({
    origin: "https://codezynx.netlify.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/post", postRoutes);
app.use("/api/ai", aiRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.get('/',(req,res)=>{
  res.send({
    activeStatus:true,
    error:false
  })
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});

export { io };
