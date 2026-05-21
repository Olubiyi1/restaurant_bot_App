import prisma from "../config/prisma.js";
import {
  addItemToCart,
  getCurrentCart,
  getCartTotal,
  clearCart,
  getOrderHistory,
  createPendingOrder,
} from "./order.service.js";
import menu from "../data/menu.js"

// Get or create session
const getOrCreateSession = async (sessionId) => {
  let session = await prisma.session.findUnique({
    where: { id: sessionId }
  })

  if (!session) {
    session = await prisma.session.create({
      data: { id: sessionId }
    })
  }

  return session
}
//  main menu message
const mainMenu = () => {
  return `Welcome to Foodie Bot! 🍔\n
Please select an option:\n
1 → Place an order
99 → Checkout order
98 → Order history
97 → Current order
0 → Cancel order`
}

// Format categories message
const showCategories = () => {
  const list = menu.map(cat => `${cat.id} → ${cat.name}`).join("\n")
  return `Please select a category:\n\n${list}\n\n0 → Back to main menu`
}

// Format items message
const showItems = (categoryId) => {
  const category = menu.find(cat => cat.id === categoryId)
  if (!category) return "Invalid category. Please try again."

  const list = category.items.map(item =>
    `${item.id} → ${item.name} - ₦${item.price.toLocaleString()}\n   ${item.description}`
  ).join("\n\n")

  return `${category.name}:\n\n${list}\n\n0 → Back to categories`
}

// Format current cart message
const showCart = async (sessionId) => {
  const cartItems = await getCurrentCart(sessionId)

  if (cartItems.length === 0) return "Your cart is empty."

  const list = cartItems.map(item =>
    `• ${item.name} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`
  ).join("\n")

  const total = await getCartTotal(sessionId)

  return `Your current order:\n\n${list}\n\nTotal: ₦${total.toLocaleString()}\n\n1 → Keep ordering\n99 → Checkout\n0 → Cancel order`
}
// Format order history message
const showOrderHistory = async (sessionId) => {
  const orders = await getOrderHistory(sessionId)

  if (orders.length === 0) return "You have no order history."

  const list = orders.map((order, index) => {
    const items = order.items.map(item =>
      `   • ${item.name} x${item.quantity}`
    ).join("\n")

    const date = new Date(order.createdAt).toLocaleDateString()
    const scheduled = order.scheduledFor
      ? `Scheduled for: ${new Date(order.scheduledFor).toLocaleString()}`
      : "Immediate order"

    return `Order ${index + 1} — ₦${order.total.toLocaleString()} — ${order.status}\n${items}\n   ${scheduled}\n   Date: ${date}`
  }).join("\n\n")

  return `Your order history:\n\n${list}`
}


// Main function — processes every message
export const processMessage = async (sessionId, message) => {
  const session = await getOrCreateSession(sessionId)
  const input = message.trim()

  // ─── Global Commands ───────────────────────────────

  // 98 → Order history (works from anywhere)
  if (input === "98") {
    const historyMessage = await showOrderHistory(sessionId)
    return {
      message: historyMessage,
      action: null
    }
  }

  // 97 → Current order (works from anywhere)
  if (input === "97") {
    const cartMessage = await showCart(sessionId)
    return {
      message: cartMessage,
      action: null
    }
  }

  // 0 → Cancel order (works from anywhere)
  if (input === "0") {
    const cartItems = await getCurrentCart(sessionId)

    if (cartItems.length === 0) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { state: "IDLE", currentCategory: null }
      })
      return {
        message: `No active order to cancel.\n\n${mainMenu()}`,
        action: null
      }
    }

    await clearCart(sessionId)
    await prisma.session.update({
      where: { id: sessionId },
      data: { state: "IDLE", currentCategory: null }
    })

    return {
      message: `Your order has been cancelled.\n\n${mainMenu()}`,
      action: null
    }
  }

  // 99 → Checkout (works from anywhere)
  if (input === "99") {
    const cartItems = await getCurrentCart(sessionId)

    if (cartItems.length === 0) {
      return {
        message: `No order to place.\n\n${mainMenu()}`,
        action: null
      }
    }

    const total = await getCartTotal(sessionId)
    const cartMessage = await showCart(sessionId)
    const order = await createPendingOrder(sessionId)

    await prisma.session.update({
      where: { id: sessionId },
      data: { state: "AWAITING_CHECKOUT" }
    })

    return {
      message: `${cartMessage}\n\nClick the button below to pay.`,
      action: "PAYMENT",
      total,
      orderId: order.id
    }
  }

  // State Logics

  // IDLE state
  if (session.state === "IDLE") {
    if (input === "1") {
      await prisma.session.update({
        where: { id: sessionId },
        data: { state: "BROWSING_CATEGORIES" }
      })
      return {
        message: showCategories(),
        action: null
      }
    }

    return {
      message: `Invalid option.\n\n${mainMenu()}`,
      action: null
    }
  }

  // BROWSING_CATEGORIES state
  if (session.state === "BROWSING_CATEGORIES") {
    const categoryId = parseInt(input)
    const category = menu.find(cat => cat.id === categoryId)

    if (!category) {
      return {
        message: `Invalid option.\n\n${showCategories()}`,
        action: null
      }
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        state: "BROWSING_ITEMS",
        currentCategory: categoryId
      }
    })

    return {
      message: showItems(categoryId),
      action: null
    }
  }

  // BROWSING_ITEMS state
  if (session.state === "BROWSING_ITEMS") {
    const category = menu.find(cat => cat.id === session.currentCategory)
    const itemId = parseInt(input)
    const item = category?.items.find(i => i.id === itemId)

    if (!item) {
      return {
        message: `Invalid option.\n\n${showItems(session.currentCategory)}`,
        action: null
      }
    }

    await addItemToCart(sessionId, item)
    await prisma.session.update({
      where: { id: sessionId },
      data: { state: "ORDER_ACTIVE" }
    })

    return {
      message: ` ${item.name} added to your order!\n\nWhat would you like to do next?\n\n1 → Keep ordering\n99 → Checkout\n97 → View current order\n0 → Cancel order`,
      action: null
    }
  }

  // ORDER_ACTIVE state
  if (session.state === "ORDER_ACTIVE") {
    if (input === "1") {
      await prisma.session.update({
        where: { id: sessionId },
        data: { state: "BROWSING_CATEGORIES" }
      })
      return {
        message: showCategories(),
        action: null
      }
    }

    return {
      message: `Invalid option.\n\n1 → Keep ordering\n99 → Checkout\n97 → View current order\n0 → Cancel order`,
      action: null
    }
  }

  // AWAITING_CHECKOUT state
  if (session.state === "AWAITING_CHECKOUT") {
    return {
      message: `You have a pending payment.\n\nComplete your payment or cancel your order.\n\n0 → Cancel order`,
      action: null
    }
  }

  // Fallback
  return {
    message: mainMenu(),
    action: null
  }
}

// Reset session to IDLE after payment
export const resetSession = async (sessionId) => {
  await clearCart(sessionId)
  await prisma.session.update({
    where: { id: sessionId },
    data: { state: "IDLE", currentCategory: null }
  })
}
