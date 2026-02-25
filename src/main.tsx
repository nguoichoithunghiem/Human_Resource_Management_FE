import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebSocketProvider } from './context/WebSocketContext.tsx'
import { Toaster } from 'react-hot-toast'

  // 🔥 FIX SockJS global issue (Vite)
  ; (window as any).global = window

createRoot(document.getElementById('root')!).render(
  <WebSocketProvider>
    <Toaster position="top-right" />
    <App />
  </WebSocketProvider>
)