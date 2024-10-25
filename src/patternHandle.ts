import init, { greet, Handle } from '../wasm-controller/pkg/cad_pattern_editor.js';
import { getSettingsPayload } from './settings';
import { updateAvailableLayers } from './setupGUIOptions';

let PATTERN_WASM_HANDLE: any = undefined;
let wasmStarted: boolean = false;

export function intilizePattern(payload: string): [number[], number[]] | undefined {
  if (!wasmStarted) return;

  PATTERN_WASM_HANDLE = new Handle(payload, getSettingsPayload());
  console.log(PATTERN_WASM_HANDLE.get_number_entities(), 'entities have been parsed');
  console.log(PATTERN_WASM_HANDLE.get_settings());

  updateAvailableLayers(PATTERN_WASM_HANDLE);

  return PATTERN_WASM_HANDLE.get_draw_sequence();
}

export async function startUpWasm() {
  await init();
  console.log('Started wasm');
  greet('Newb');
  wasmStarted = true;
}
