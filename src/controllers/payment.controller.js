import {initializePayment as initPaystack,verifyPayment as verifyPaystack} from "../services/payment.service.js"

import {updateOrderStatus,clearCart} from "../services/order.service.js"

import { resetSession } from "../services/bot.service.js"

export const initializePayment = async (req, res) => {
  try {
    const { orderId, sessionId, total } = req.body

    if (!orderId || !sessionId || !total) {
      return res.status(400).json({
        success: false,
        message: "orderId, sessionId and total are required"
      })
    }

    // Generate dummy email from sessionId since we have no auth
    const email = `customer_${sessionId}@foodiebot.com`

    // Initialize payment with Paystack
    const paymentData = await initPaystack(email, total, orderId, sessionId)

    return res.status(200).json({
      success: true,
      data: {
        authorizationUrl: paymentData.authorization_url,
        reference:        paymentData.reference,
        accessCode:       paymentData.access_code
      }
    })

  } catch (error) {
    console.error("Initialize payment error:", error)
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed"
    })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Reference is required"
      })
    }

    // Verify payment with Paystack
    const paymentData = await verifyPaystack(reference)

    // Check if payment was successful
    if (paymentData.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful"
      })
    }

    // Extract orderId and sessionId from metadata
    const { orderId, sessionId } = paymentData.metadata

    // Update order status to PAID
    await updateOrderStatus(orderId, "PAID", reference)

    // Reset session back to IDLE
    await resetSession(sessionId)

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      data: {
        orderId,
        sessionId,
        amount: paymentData.amount / 100,
        reference
      }
    })

  } catch (error) {
    console.error("Verify payment error:", error)
    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    })
  }
}