import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { verifyPayment } from "../services/api.js"

const PaymentSuccess = () => {
  const [status, setStatus]   = useState("verifying")
  const [message, setMessage] = useState("Verifying your payment...")
  const navigate              = useNavigate()
  const [searchParams]        = useSearchParams()

  useEffect(() => {
    const verify = async () => {
      // Get reference from URL
      // Paystack adds ?reference=xxx to the callback URL
      const reference = searchParams.get("reference")

      if (!reference) {
        setStatus("failed")
        setMessage("Invalid payment reference.")
        return
      }

      try {
        const response = await verifyPayment(reference)

        if (response.success) {
          setStatus("success")
          setMessage("Payment successful! Your order has been confirmed.")

          // Redirect back to chat after 3 seconds
          setTimeout(() => navigate("/"), 3000)

        } else {
          setStatus("failed")
          setMessage("Payment verification failed. Please contact support.")
        }

      } catch (error) {
        setStatus("failed")
        setMessage("Something went wrong. Please contact support.")
      }
    }

    verify()
  }, [])

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">

        {status === "verifying" && (
          <>
            <div className="spinner"></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <p className="redirect-text">
              Redirecting you back to chat in 3 seconds...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="failed-icon">❌</div>
            <h2>Payment Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate("/")}>
              Go Back To Chat
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default PaymentSuccess