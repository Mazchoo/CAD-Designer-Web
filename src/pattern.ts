import init, { greet, get_buffer_udpate, read_pattern } from '../leptos-controller/pkg/cad_pattern_editor.js';

let PATTERN_WASM_HANDLE: any = undefined;
let wasmStarted: boolean = false;


export function intilizePattern(payload: string): boolean {
  if (!wasmStarted) return false;
  return read_pattern(payload);
}

export async function startUpWasm() {
  await init();
  console.log('Started wasm');
  greet('Newb');
  wasmStarted = true;
}
