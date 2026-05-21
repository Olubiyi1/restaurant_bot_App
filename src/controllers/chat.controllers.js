import { processMessage } from "../services/bot.service.js"

export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body

    // Validate request
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Message and sessionId are required"
      })
    }

    // Process message through bot
    const response = await processMessage(sessionId, message)

    return res.status(200).json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error("Chat controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
}

export const getOrderHistory = async (req, res) => {
  try {
    const { sessionId } = req.params

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "SessionId is required"
      })
    }

    const { getOrderHistory } = await import("../services/order.service.js")
    const orders = await getOrderHistory(sessionId)

    return res.status(200).json({
      success: true,
      data: orders
    })

  } catch (error) {
    console.error("Order history controller error:", error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    })
  }
}