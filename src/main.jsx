import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.jsx'

// Vite polyfills for Node.js modules required by @anam-ai/js-sdk
window.global = window;
window.Buffer = Buffer;
window.process = { env: {} };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
