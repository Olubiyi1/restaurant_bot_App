import prisma from "../config/prisma.js";

// add item to cart
export const addItemToCart = async(sessionId,item)=>{
    // check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
            where:{
                sessionId,
                menuItemId: item.id
            }
    })

    // If item exists, increase quantity
    if (existingItem){
        return await prisma.cartItem.update({
            where:{id:existingItem.id},
            data:{quantity:existingItem.quantity + 1}
        })
    }
      // If item does not exist, create new cart item
  return await prisma.cartItem.create({
    data: {
      sessionId,
      menuItemId: item.id,
      name:       item.name,
      price:      item.price,
      quantity:   1
    }
  })
  
}
// Get current cart
export const getCurrentCart = async (sessionId) => {
  return await prisma.cartItem.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" }
  })
}

// Get cart total
export const getCartTotal = async (sessionId) => {
  const cartItems = await getCurrentCart(sessionId)

  return cartItems.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
}

// Clear cart
export const clearCart = async (sessionId) => {
  return await prisma.cartItem.deleteMany({
    where: { sessionId }
  })
}

// Save order to history
export const saveOrder = async (sessionId, paymentRef, scheduledFor = null) => {
  // Get current cart items
  const cartItems = await getCurrentCart(sessionId)

  // Calculate total
  const total = await getCartTotal(sessionId)

  // Create order with order items
  const order = await prisma.order.create({
    data: {
      sessionId,
      total,
      status:      "PAID",
      paymentRef,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      items: {
        create: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          name:       item.name,
          price:      item.price,
          quantity:   item.quantity
        }))
      }
    },
    include: { items: true }
  })

  // Clear cart after saving order
  await clearCart(sessionId)

  return order
}

// Get order history
export const getOrderHistory = async (sessionId) => {
  return await prisma.order.findMany({
    where: { sessionId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  })
}

// Create pending order for payment
export const createPendingOrder = async (sessionId, scheduledFor = null) => {
  const cartItems = await getCurrentCart(sessionId)
  const total = await getCartTotal(sessionId)

  return await prisma.order.create({
    data: {
      sessionId,
      total,
      status:      "PENDING",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      items: {
        create: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          name:       item.name,
          price:      item.price,
          quantity:   item.quantity
        }))
      }
    },
    include: { items: true }
  })
}

// Update order status
export const updateOrderStatus = async (orderId, status, paymentRef = null) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(paymentRef && { paymentRef })
    }
  })
}

