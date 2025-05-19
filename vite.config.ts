import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Hoặc plugin tương ứng khác nếu dùng Vue, etc.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Thường cần thiết khi chạy trong container như CodeSandbox
    hmr: {
       // Có thể cần cấu hình clientPort nếu bạn dùng container và port forwarding phức tạp
       // clientPort: 443 
    },
    // === PHẦN QUAN TRỌNG ===
    allowedHosts: [
      'hd42nm-5173.csb.app', // Thêm host bị chặn vào đây
      // Bạn có thể thêm các host khác nếu cần, ví dụ:
      // 'localhost',
      // '127.0.0.1',
    ],
    // ========================
  },
});