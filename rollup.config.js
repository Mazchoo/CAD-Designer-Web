import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const OUT_PATH = 'dist';
const ARGS = process.argv.slice(2);
const DEBUG_MODE = ARGS.includes('-n') && ARGS[ARGS.indexOf('-n') + 1] === 'debug';

export default [
  {
    input: './src/main.ts',
    output: [
      {
        file: `${OUT_PATH}/bundle.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: DEBUG_MODE
      ? [nodeResolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' })]
      : [nodeResolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()],
    watch: {
      clearScreen: false,
    },
  },
];
