import init, { greet, get_buffer_udpate } from '../leptos-controller/pkg/cad_pattern_editor.js';

let patternWasmHandle: any = undefined;
let wasmStarted: boolean = false;

class PatternHandler {
  // Constructor to initialize the properties
  constructor() {}

  // Method to greet
  getNumberOfBlocks() {
    if (patternWasmHandle === undefined) {
      console.log('There is no pattern');
    } else {
      console.log('There is a pattern');
    }
  }
}

export async function startUpWasm() {
  await init();
  console.log('Started wasm');
  greet('Newb');
  const buffetUpdate = get_buffer_udpate();
  console.log(buffetUpdate);
  wasmStarted = true;
  return new PatternHandler();
}
