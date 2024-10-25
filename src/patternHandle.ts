import init, { greet, Handle } from '../wasm-controller/pkg/cad_pattern_editor.js';
import { getSettingsPayload } from './settings';
import { updateAvailableLayers, updateAvailableBlocks } from './setupGUIOptions';
import { mapBuffersToDevice } from './buffers';

let PATTERN_WASM_HANDLE: any = undefined;
let wasmStarted: boolean = false;

export async function startUpWasm() {
  await init();
  console.log('Started wasm');
  greet('User');
  wasmStarted = true;
}

export function intilizePattern(payload: string): [number[], number[]] | undefined {
  if (!wasmStarted) return;

  PATTERN_WASM_HANDLE = new Handle(payload, getSettingsPayload());
  console.log(PATTERN_WASM_HANDLE.get_number_entities(), 'entities have been parsed');
  console.log(PATTERN_WASM_HANDLE.get_settings());

  updateAvailableLayers(PATTERN_WASM_HANDLE);
  updateAvailableBlocks(PATTERN_WASM_HANDLE);

  const drawArrays = PATTERN_WASM_HANDLE.get_draw_sequence();
  mapBuffersToDevice(new Float32Array(drawArrays[0]), new Uint32Array(drawArrays[1]));
}
