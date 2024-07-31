import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const outPath = 'dist';

export default [
  {
    input: './src/main.ts',
    output: [
      {
        file: `${outPath}/bundle.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [nodeResolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()],
    watch: {
      clearScreen: false,
    },
  },
];
