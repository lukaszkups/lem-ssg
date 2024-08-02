import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    nodePolyfills(),
  ],
  build: {
    lib: {
      name: 'lem',
      entry: resolve(__dirname, './src/engine.ts'),
      formats: ['es', 'umd']
    }
  }
});
