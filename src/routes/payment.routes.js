import { Router } from "express";
import { initializePayment,verifyPayment} from"../controllers/payment.controller.js"

const paymentRoute = Router()

paymentRoute.post("/initialize", initializePayment)
paymentRoute.post("/verify", verifyPayment)

export default paymentRoute;