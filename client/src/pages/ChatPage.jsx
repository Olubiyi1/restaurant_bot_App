import ChatWindow from "../components/ChatWindow.jsx"
import InputBar from "../components/InputBar.jsx"
import useChat from "../hooks/useChat.js"

const ChatPage = () => {
  const { messages, isTyping, handleSend, handlePayment } = useChat()

  return (
    <div className="chat-page">
      <ChatWindow
        messages={messages}
        isTyping={isTyping}
        onPayment={handlePayment}
      />
      <InputBar
        onSend={handleSend}
        isTyping={isTyping}
      />
    </div>
  )
}

export default ChatPage