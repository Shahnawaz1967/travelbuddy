// Main entry point for the React application
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import App from "./App.jsx"
import { AuthProvider } from "./contexts/AuthContext.jsx"
import { TOAST_CONFIG } from "./utils/constants.js"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position={TOAST_CONFIG.position}
          toastOptions={{
            duration: TOAST_CONFIG.duration,
            style: TOAST_CONFIG.style,
            success: TOAST_CONFIG.success,
            error: TOAST_CONFIG.error,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
