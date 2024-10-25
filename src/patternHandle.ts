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

const updateCanvasData = (handle: Handle) => {
  const drawArrays = handle.get_draw_sequence();
  mapBuffersToDevice(new Float32Array(drawArrays[0]), new Uint32Array(drawArrays[1]));
}

const addViewCallbacksToViews = (handle: Handle) => {
  const modelCheckOption = document.getElementById(`View=>Model`) as HTMLInputElement;
  modelCheckOption.addEventListener("click", () => {
    if (handle === undefined) { return; }
    handle.set_view("Model");
    updateCanvasData(handle);
  });

  for (const name of handle.get_all_block_names()) {
    const blockCheckOption = document.getElementById(`Block=>${name}`) as HTMLInputElement;
    const viewName = `Block=>${name}`;
    blockCheckOption.addEventListener("click", () => {
      if (handle === undefined) { return; }
      handle.set_view(viewName);
      updateCanvasData(handle);
    });
  }
}

export function intilizePattern(payload: string): [number[], number[]] | undefined {
  if (!wasmStarted) return;

  PATTERN_WASM_HANDLE = new Handle(payload, getSettingsPayload());
  console.log(PATTERN_WASM_HANDLE.get_number_entities(), 'entities have been parsed');

  updateAvailableLayers(PATTERN_WASM_HANDLE);
  updateAvailableBlocks(PATTERN_WASM_HANDLE);
  addViewCallbacksToViews(PATTERN_WASM_HANDLE);

  updateCanvasData(PATTERN_WASM_HANDLE);
}
