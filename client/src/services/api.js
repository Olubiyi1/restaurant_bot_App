import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

// Send message to bot
export const sendMessage = async (message, sessionId) => {
  const response = await api.post("/api/chat", {
    message,
    sessionId
  })
  return response.data
}

// Get order history
export const getOrderHistory = async (sessionId) => {
  const response = await api.get(`/api/chat/history/${sessionId}`)
  return response.data
}

// Initialize payment
export const initializePayment = async (orderId, sessionId, total) => {
  const response = await api.post("/api/payment/initialize", {
    orderId,
    sessionId,
    total
  })
  return response.data
}

// Verify payment
export const verifyPayment = async (reference) => {
  const response = await api.post("/api/payment/verify", {
    reference
  })
  return response.data
}