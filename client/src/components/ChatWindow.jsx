import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble.jsx"
import TypingIndicator from "./TypingIndicator.jsx"

const ChatWindow = ({ messages, isTyping, onPayment }) => {
  const bottomRef = useRef(null)

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-avatar">🍔</div>
        <div className="header-info">
          <h3>Foodie Bot</h3>
          <span>Always online</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            onPayment={onPayment}
          />
        ))}

        <TypingIndicator isTyping={isTyping} />

        {/* Invisible div at bottom for auto scroll */}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default ChatWindow