import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createOrGetConvo } from "../controller/conversation.controller.js";

const convoRoute = Router();

convoRoute.post("/get-convo", authMiddleware, createOrGetConvo);

export default convoRoute;
