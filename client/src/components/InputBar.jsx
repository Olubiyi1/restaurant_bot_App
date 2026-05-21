import { useState } from "react"

const InputBar = ({ onSend, isTyping }) => {
  const [input, setInput] = useState("")

  const handleSubmit = () => {
    if (!input.trim() || isTyping) return
    onSend(input.trim())
    setInput("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className="input-bar">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a number to select an option..."
        disabled={isTyping}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isTyping}
      >
        Send
      </button>
    </div>
  )
}

export default InputBar