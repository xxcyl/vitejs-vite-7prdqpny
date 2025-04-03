import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BreathingProvider } from './contexts/BreathingContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BreathingProvider>
      <App />
    </BreathingProvider>
  </React.StrictMode>,
)