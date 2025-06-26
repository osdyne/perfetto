import { defineConfig } from "vite";
import { execSync } from "node:child_process";

const gitHash = execSync('git rev-parse --short=9 HEAD').toString().trim();

export default defineConfig({
  server: {
    proxy: {
      '/perfetto': {
        target: `http://localhost:10000/v48.1-${gitHash}/`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/perfetto/, ''),
      },
    }
  }
})
