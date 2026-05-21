import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json"
  }
})

// Initialize payment
export const initializePayment = async (email, amount, orderId, sessionId) => {
  const response = await paystackAPI.post("/transaction/initialize", {
    email,
    amount:       amount * 100,
    reference:    orderId,
    callback_url: `${process.env.CLIENT_URL}/payment/verify`,
    metadata: {
      orderId,
      sessionId
    }
  })

  return response.data.data
}

// Verify payment
export const verifyPayment = async (reference) => {
  const response = await paystackAPI.get(`/transaction/verify/${reference}`)
  return response.data.data
}