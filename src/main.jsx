import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerOffline } from './utils/offline'
import { API_BASE_URL } from './models/api/axiosClient'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Hỗ trợ nghe nhạc khi không có mạng: chỉ ở bản build chính thức (xem public/sw.js, src/utils/offline.js)
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    registerOffline(API_BASE_URL).catch((err) => console.warn('Không bật được chế độ offline:', err));
  });
}
