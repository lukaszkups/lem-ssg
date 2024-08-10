import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import builtins from 'rollup-plugin-node-builtins';
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    builtins(),
    nodePolyfills(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  optimizeDeps: {
    include: ['uglifycss', 'fs', 'watch', 'showdown', 'path'],
    exclude: ['uglify-js']
  },
  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'lem-ssg'
    },
    rollupOptions: {
      external: ['uglifycss', 'fs', 'watch', 'showdown', 'path'],
      output: {
        globals: {
          UglifyJS: 'uglify-js',
          uglifycss: 'uglifycss',
          fs: 'fs',
          watch: 'watch',
          showdown: 'showdown',
          path: 'path'
        },
      },
    }
  },
  resolve: {
    alias: {
      src: resolve('src/'),
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      fs: 'rollup-plugin-node-polyfills/polyfills/empty',
    }
  }
});
