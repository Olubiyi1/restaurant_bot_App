import { Router } from "express";
import { sendMessage,getOrderHistory } from "../controllers/chat.controllers.js";

const chatRoute = Router()

chatRoute.post("/", sendMessage)
chatRoute.get("/history/:sessionId", getOrderHistory)
export default chatRoute;