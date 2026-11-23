import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { localApi } from "./dev/localApi";
export default defineConfig({
  plugins: [react(), localApi()],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  server: { fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"] } },
});
