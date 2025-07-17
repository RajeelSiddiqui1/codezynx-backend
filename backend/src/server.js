// import express from "express";
// import "dotenv/config";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import path from "path";
// import "dotenv/config";


// import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import chatRoutes from "./routes/chat.route.js";
// import postRoutes from "./routes/post.route.js"

// import { connectDB } from "./lib/db.js";

// const app = express();
// const PORT = process.env.PORT;

// const __dirname = path.resolve();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true, // allow frontend to send cookies
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/post", postRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   connectDB();
// });



// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

// Routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import postRoutes from "./routes/post.route.js";
import aiRoutes from "./routes/ai.route.js"

// Socket emitter integration
import { setSocketIOInstance } from "./controllers/post.controller.js";
import { connectDB } from "./lib/db.js";

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://codezynx.netlify.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// ✅ Register socket events
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join_post", (postId) => {
    socket.join(postId);
    console.log(`🔗 User joined room: ${postId}`);
  });

  socket.on("leave_post", (postId) => {
    socket.leave(postId);
    console.log(`❌ User left room: ${postId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// 🔌 Inject io to controller
setSocketIOInstance(io);

// Middleware
const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const router = app.Router();

router.get('/check',(req,res)=>{
  res.send('hello world')
}
  )
// Routes
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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  connectDB();
});

export { io };

