import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      // 여기에 CSS 전처리기 옵션을 추가할 수 있습니다
    }
  }
}) 