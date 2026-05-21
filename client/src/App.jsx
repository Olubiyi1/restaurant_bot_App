import { BrowserRouter, Routes, Route } from "react-router-dom"
import ChatPage from "./pages/ChatPage.jsx"
import PaymentSuccess from "./pages/PaymentSuccess.jsx"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/payment/verify" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App