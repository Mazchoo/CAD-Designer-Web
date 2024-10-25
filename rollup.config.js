import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import wasm from '@rollup/plugin-wasm';
import copy from 'rollup-plugin-copy';

const ARGS = process.argv.slice(2);
const DEBUG_MODE = ARGS.includes('-n') && ARGS[ARGS.indexOf('-n') + 1] === 'debug';

export default [
  {
    input: './src/main.ts',
    output: [
      {
        file: `dist/bundle.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],

    plugins: DEBUG_MODE
      ? [
          nodeResolve(),
          commonjs(),
          wasm(),
          copy({
            targets: [{ src: 'wasm-controller/pkg/cad_pattern_editor_bg.wasm', dest: 'dist' }],
          }),
          typescript({ tsconfig: './tsconfig.json' }),
        ]
      : [
          nodeResolve(),
          commonjs(),
          wasm(),
          copy({
            targets: [{ src: 'wasm-controller/pkg/cad_pattern_editor_bg.wasm', dest: 'dist' }],
          }),
          typescript({ tsconfig: './tsconfig.json' }),
          terser(),
        ],
    watch: {
      clearScreen: false,
    },
  },
];
