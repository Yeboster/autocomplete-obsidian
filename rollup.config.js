import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
const TEST_VAULT = 'test-vault/.obsidian/plugins/autocomplete-obsidian';
const STYLES_FILE = './src/assets/styles.css'

export default {
  input: './src/main.ts',
  output: {
    dir: 'dist/',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
    copy({
      targets: [
        { src: 'dist/main.js', dest: TEST_VAULT },
        { src: ['manifest.json', STYLES_FILE], dest: TEST_VAULT }
      ], flatten: true
    }),
    copy({
      targets: [
        { src: ['manifest.json', STYLES_FILE], dest: 'dist' }
      ], flatten: true
    })
  ]
};
