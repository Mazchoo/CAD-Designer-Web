import init, { greet, Pattern } from '../leptos-controller/pkg/cad_pattern_editor.js';

let PATTERN_WASM_HANDLE: any = undefined;
let wasmStarted: boolean = false;


export function intilizePattern(payload: string): boolean {
  if (!wasmStarted) return false;
  PATTERN_WASM_HANDLE = new Pattern(payload);
  console.log(PATTERN_WASM_HANDLE.get_number_entities())
  return true;
}

export async function startUpWasm() {
  await init();
  console.log('Started wasm');
  greet('Newb');
  wasmStarted = true;
}
