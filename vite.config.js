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
    sourcemap: true,
    lib: {
      name: 'lem-ssg',
      fileName: 'lem-ssg',
      entry: resolve(__dirname, 'main.ts'),
    }
  },
  resolve: {
    alias: {
      src: resolve('src/'),
      util: 'rollup-plugin-node-polyfills/polyfills/util',
    }
  }
});
