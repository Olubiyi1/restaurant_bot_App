const SESSION_KEY = "restaurant_session_id"

const generateId = () => {
  return "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
}

export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY)

  if (!sessionId) {
    sessionId = generateId()
    localStorage.setItem(SESSION_KEY, sessionId)
  }

  return sessionId
}

export const clearSessionId = () => {
  localStorage.removeItem(SESSION_KEY)
}