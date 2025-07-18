import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve, join } from 'node:path';

const gitHash = execSync('git rev-parse --short=9 HEAD').toString().trim();

const target = `v48.1-${gitHash}`;

export default ({ mode }: { mode: 'production' | 'development' }) => {
  if (mode === 'development') {
    return defineConfig({
      server: {
        proxy: {
          '/perfetto': {
            target: `http://localhost:10000/${target}`,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/perfetto/, '')
          }
        }
      }
    });
  }

  if (mode === 'production') {
    return defineConfig({
      plugins: [
        viteStaticCopy({
          targets: [
            {
              src: join(resolve('ui/out/dist', target), '*'),
              dest: 'perfetto'
            },
            {
              src: join(resolve(__dirname, "assets"), '*'),
              dest: 'assets'

            }
          ]
        })
      ],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'index.html'),
            file: resolve(__dirname, 'file.html'),
            stream: resolve(__dirname, 'stream.html')
          }
        }
      }
    });
  }
};
