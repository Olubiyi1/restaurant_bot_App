const TypingIndicator = ({ isTyping }) => {
  if (!isTyping) return null

  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export default TypingIndicator