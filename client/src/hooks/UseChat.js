import { useState, useEffect } from "react"
import { getSessionId } from "../utils/session.js"
import { sendMessage as sendMessageApi, initializePayment } from "../services/api.js"

const useChat = () => {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => getSessionId())

  // Add a message to the chat
  const addMessage = (text, sender, action = null, meta = {}) => {
    setMessages(prev => [
      ...prev,
      {
        id:`${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        sender,
        action,
        meta,
        timestamp: new Date()
      }
    ])
  }

  // Send welcome message on first load
  useEffect(() => {
  addMessage(
    `Welcome to Foodie Bot! 🍔\n\nPlease select an option:\n\n1 → Place an order\n99 → Checkout order\n98 → Order history\n97 → Current order\n0 → Cancel order`,
    "bot"
  )
}, [])

  // Send message
  const handleSend = async (message) => {
    // Add customer message to chat (dont show "hello" trigger)
    if (message !== "hello") {
      addMessage(message, "customer")
    }

    // Show typing indicator
    setIsTyping(true)

    try {
      const response = await sendMessageApi(message, sessionId)
      const { data } = response

      // Hide typing indicator
      setIsTyping(false)

      // Add bot response to chat
      addMessage(data.message, "bot", data.action, {
        total:   data.total,
        orderId: data.orderId
      })

    } catch (error) {
      setIsTyping(false)
      addMessage("Something went wrong. Please try again.", "bot")
    }
  }

  // Handle payment
  const handlePayment = async (orderId, total) => {
    try {
      setIsTyping(true)

      const response = await initializePayment(orderId, sessionId, total)
      setIsTyping(false)

      if (response.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorizationUrl
      } else {
        addMessage("Payment initialization failed. Please try again.", "bot")
      }

    } catch (error) {
      setIsTyping(false)
      addMessage("Payment initialization failed. Please try again.", "bot")
    }
  }

  return {
    messages,
    isTyping,
    sessionId,
    handleSend,
    handlePayment
  }
}

export default useChat