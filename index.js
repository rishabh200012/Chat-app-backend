import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import http from "http";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import connectDb from "./src/config/dbConfig.js";
import errormiddleware from "./src/middleware/error.middleware.js";
import userRoute from "./src/routes/user.routes.js";
import convoRoute from "./src/routes/conversation.routes.js";
import messageRoute from "./src/routes/message.routes.js";
import { Message } from "./src/model/message.model.js";

dotenv.config();

const app = express();

const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-frontend-alpha-ten.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());

app.use(express.json());

app.use("/", userRoute);
app.use("/", convoRoute);
app.use("/", messageRoute);

const onlineUsers = new Map();

io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return next(new Error("Unauthorized: Token not found"));
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_KEY);

    socket.data.user = decoded;

    next();
  } catch (error) {
    next(new Error("Unauthorized: Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.user.id;

  onlineUsers.set(userId, socket.id);

  io.emit("online-users", [...onlineUsers.keys()]);

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online-users", [...onlineUsers.keys()]);
  });

  socket.on("send-message", async (data) => {
    try {
      const message = await Message.create({
        conversationId: data.conversationId,
        sender: userId,
        text: data.text,
      });

      socket.emit("receive-message", message);

      const receiverSocketId = onlineUsers.get(data.receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", message);
      }
    } catch (error) {
      console.log(error);
    }
  });
});
app.use(errormiddleware);

const startServer = async () => {
  try {
    await connectDb();

    server.listen(process.env.PORT || 5005, () => {
      console.log("Server running on port", process.env.PORT);
    });
  } catch (error) {
    console.error(error);
  }
};
startServer();
