@@ .. @@
 // https://vitejs.dev/config/
 export default defineConfig({
   plugins: [react()],
+  server: {
+    host: true,
+    port: 5173
+  },
   optimizeDeps: {
     exclude: ['lucide-react'],
   },