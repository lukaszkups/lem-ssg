import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    nodePolyfills(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      name: 'lem-ssg',
      entry: resolve(__dirname, 'main.ts'),
      formats: ['es']
    }
  },
  resolve: {
    alias: {
      src: resolve('src/')
    }
  }
});
