import init, { greet, Handle } from '../wasm-controller/pkg/cad_pattern_editor.js';
import { getSettingsPayload, colorMap, getNextColor } from './settings';
import { updateAvailableLayers, updateAvailableBlocks, updateSelection } from './setupGUIOptions';
import { mapBuffersToDevice } from './buffers';
import { addHighlightBbox } from './rendering';
import { setRectWorldCoords } from './fabricHandle';

let PATTERN_WASM_HANDLE: Handle | undefined = undefined;
let wasmStarted: boolean = false;

export async function startUpWasm() {
  await init();
  console.log('Started wasm');
  greet('User');
  wasmStarted = true;
}

const updateCanvasData = (handle: Handle | undefined) => {
  if (handle === undefined) {
    return;
  }
  const drawArrays = handle.get_draw_sequence();
  mapBuffersToDevice(new Float32Array(drawArrays[0]), new Uint32Array(drawArrays[1]));
};

const addViewCallbacksToLayers = (handle: Handle | undefined) => {
  if (handle === undefined) {
    return;
  }
  for (const layer of handle.get_all_layers()) {
    const layerColor = document.getElementById(`LayerColor=>${layer}`) as HTMLInputElement | undefined;
    if (layerColor) {
      // Take the first class which is a color in the color map
      layerColor.addEventListener('click', () => {
        const currentColor = Array.from(layerColor.classList).filter((c) => colorMap.has(c))[0];
        if (currentColor === undefined) {
          return;
        }
        const [nextColor, nextHex] = getNextColor(currentColor);
        layerColor.classList.remove(currentColor);
        layerColor.classList.add(nextColor);
        handle.set_layer_color(layer, nextHex);
        updateCanvasData(handle);
      });
    }

    const layerOption = document.getElementById(`Layer=>${layer}`) as HTMLInputElement | undefined;
    if (layerOption) {
      // Take the first class which is a color in the color map
      layerOption.addEventListener('click', () => {
        if (layerOption.checked) {
          handle.enable_layer(layer);
        } else {
          handle.disable_layer(layer);
        }
        updateCanvasData(handle);
      });
    }
  }
};

const addViewCallbacksToViews = (handle: Handle | undefined) => {
  if (handle === undefined) {
    return;
  }
  const modelCheckOption = document.getElementById(`View=>Model`) as HTMLInputElement | undefined;
  if (modelCheckOption !== undefined) {
    modelCheckOption.addEventListener('click', () => {
      handle.set_view('Model');
      updateCanvasData(handle);
    });
  }

  for (const name of handle.get_all_block_names()) {
    const blockCheckOption = document.getElementById(`Block=>${name}`) as HTMLInputElement | undefined;
    if (blockCheckOption === undefined) continue;
    const viewName = `Block=>${name}`;
    blockCheckOption.addEventListener('click', () => {
      handle.set_view(viewName);
      updateCanvasData(handle);
    });
  }
};

const addChangeSelectionCallbacks = (handle: Handle | undefined, keys: string[]) => {
  if (handle === undefined) {
    return;
  }
  for (const key of keys) {
    const selectionCheck = document.getElementById(`Selection=>${key}`) as HTMLInputElement | undefined;
    if (selectionCheck === undefined) continue;
    selectionCheck.addEventListener('click', () => {
      handle.change_block_selection(key);
      updateCanvasData(handle);
    });
  }
};

export function intilizePattern(payload: string): [number[], number[]] | undefined {
  if (!wasmStarted) return;

  PATTERN_WASM_HANDLE = new Handle(payload, getSettingsPayload());
  console.log(PATTERN_WASM_HANDLE.get_number_entities(), 'entities have been parsed');

  updateAvailableLayers(PATTERN_WASM_HANDLE);
  addViewCallbacksToLayers(PATTERN_WASM_HANDLE);
  updateAvailableBlocks(PATTERN_WASM_HANDLE);
  addViewCallbacksToViews(PATTERN_WASM_HANDLE);

  updateCanvasData(PATTERN_WASM_HANDLE);
}

export function selectBlockWithPoint(point: [number, number]) {
  if (PATTERN_WASM_HANDLE === undefined) return;
  const selection = PATTERN_WASM_HANDLE.select_block_with_point(new Float32Array(point));
  updateCanvasData(PATTERN_WASM_HANDLE);

  updateSelection(selection);
  addChangeSelectionCallbacks(PATTERN_WASM_HANDLE, selection);
}

export function selectBlockWithBBox(p1: [number, number], p2: [number, number]) {
  if (PATTERN_WASM_HANDLE === undefined) return;
  const [blockKeys, bbox] = PATTERN_WASM_HANDLE.select_block_with_two_points(
    new Float32Array(p1),
    new Float32Array(p2)
  );
  updateCanvasData(PATTERN_WASM_HANDLE);

  if (bbox) {
    setRectWorldCoords(bbox);
    addHighlightBbox(bbox);
  }

  updateSelection(blockKeys);
  addChangeSelectionCallbacks(PATTERN_WASM_HANDLE, blockKeys);
}
