import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
                configure: function (proxy) {
                    proxy.on('error', function (_err, _req, res) {
                        if (res && typeof res.writeHead === 'function' && !res.headersSent) {
                            res.writeHead(503, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: false,
                                error: 'PathForge AI backend server is currently unreachable on port 5000. Please ensure the backend is running, or click "Load Verified Offline Fallback".',
                            }));
                        }
                    });
                },
            },
        },
    },
});
