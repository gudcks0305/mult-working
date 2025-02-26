import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import axios from 'axios'

// API 요청에 대한 기본 설정
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
