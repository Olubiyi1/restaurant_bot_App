const MessageBubble = ({ message, onPayment }) => {
  const isBot      = message.sender === "bot"
  const isPayment  = message.action === "PAYMENT"

  // Format timestamp
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit"
  })

  // Format message text (replace \n with line breaks)
  const formatText = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ))
  }

  return (
    <div className={`message-wrapper ${isBot ? "bot" : "customer"}`}>
      {isBot && (
        <div className="bot-avatar">🍔</div>
      )}

      <div className={`message-bubble ${isBot ? "bot-bubble" : "customer-bubble"}`}>
        <div className="message-text">
          {formatText(message.text)}
        </div>

        {isPayment && (
          <button
            className="pay-button"
            onClick={() => onPayment(message.meta.orderId, message.meta.total)}
          >
            Pay ₦{message.meta.total.toLocaleString()}
          </button>
        )}

        <div className="message-time">{time}</div>
      </div>
    </div>
  )
}

export default MessageBubble