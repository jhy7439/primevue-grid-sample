import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  server: {
    // 같은 Wi-Fi에 연결된 핸드폰에서도 개발 서버에 접속할 수 있게 한다.
    host: '0.0.0.0',
    port: 5173,
  },
})
