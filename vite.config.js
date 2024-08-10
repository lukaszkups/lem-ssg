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
    // lib: {
    //   entry: resolve(__dirname, 'lib/main.ts'),
    //   name: 'lem-ssg',
    //   fileName: 'lem-ssg',
    // }
  },
  // resolve: {
  //   alias: {
  //     src: resolve('src/'),
  //     buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
  //     fs: 'rollup-plugin-node-polyfills/polyfills/empty',
  //   }
  // }
});
