import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getMessages,
  //  sendMessage
} from "../controller/message.controller.js";

const messageRoute = Router();

messageRoute.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  getMessages,
);
// messageRoute.post("/message", authMiddleware, sendMessage);
export default messageRoute;
