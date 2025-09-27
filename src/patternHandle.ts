import init, { greet, Handle, InitOutput } from '../wasm-model/pkg/cad_pattern_editor.js';
import { getInitialSettingsPayload, colorMap, getNextColor } from './settings';
import { updateAvailableLayers, updateAvailableBlocks, updateSelection } from './setupGUIOptions';
import { mapBuffersToDevice } from './buffers';
import { addHighlightBbox, getDxfWorldCoorindates } from './rendering';
import { updateBottomBarDisplay } from './displaySelection';

import {
  clearFabricCanvas,
  setRectWorldCoords,
  setRectOriginalWoordCoord,
  setRectIsScaling,
  updateScalingAnchor,
  getRotationCenter,
  offsetHighlightRect,
  scaleHighlightRect,
  resetScaleRect,
  HIGHLIGHT_RECT,
  HIGHLIGHT_RECT_ORIGINAL_WORLD,
  RECT_WORLD_COORDS,
  RECT_IS_SCALING,
  SCALING_ANCHOR,
} from './fabricHandle';
import * as fabric from 'fabric';

let PATTERN_WASM_HANDLE: Handle | undefined = undefined;
let WASM_STARTED: boolean = false;
let WASM_MODULE: InitOutput | undefined = undefined;

export async function startUpWasm() {
  WASM_MODULE = await init();
  console.log('Started wasm');
  greet('User');
  WASM_STARTED = true;
}

export function deselectAll() {
  clearFabricCanvas();
  if (PATTERN_WASM_HANDLE) {
    PATTERN_WASM_HANDLE.reset_selection();
    updateCanvasData(PATTERN_WASM_HANDLE);
  }
}

const updateCanvasData = (handle: Handle | undefined) => {
  if (handle === undefined || WASM_MODULE === undefined) {
    return;
  }
  handle.update_draw_sequence();
  const vertexView = new Float32Array(
    WASM_MODULE.memory.buffer,
    handle.get_vertex_buffer_ptr(),
    handle.get_vertex_buffer_len()
  );
  const indexView = new Uint32Array(
    WASM_MODULE.memory.buffer,
    handle.get_index_buffer_ptr(),
    handle.get_index_buffer_len()
  );
  mapBuffersToDevice(vertexView, indexView);
  updateBottomBarDisplay(handle.get_settings());
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
      deselectAll();
    });
  }

  for (const name of handle.get_all_block_names()) {
    const blockCheckOption = document.getElementById(`Block=>${name}`) as HTMLInputElement | undefined;
    if (blockCheckOption === undefined) continue;
    const viewName = `Block=>${name}`;
    blockCheckOption.addEventListener('click', () => {
      handle.set_view(viewName);
      deselectAll();
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
      handle.highlight_block(key, selectionCheck.checked);
      updateCanvasData(handle);
    });
  }
};

export function intilizePattern(payload: string): [number[], number[]] | undefined {
  if (!WASM_STARTED) return;

  PATTERN_WASM_HANDLE = new Handle(payload, getInitialSettingsPayload());
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

export function updateOffsetDisplay(rect: fabric.Rect) {
  if (HIGHLIGHT_RECT_ORIGINAL_WORLD == null || PATTERN_WASM_HANDLE == undefined) return;
  const newCoordinate = getDxfWorldCoorindates(rect.left, rect.top);
  const worldUpdate = new Float32Array([
    newCoordinate[0] - HIGHLIGHT_RECT_ORIGINAL_WORLD[0],
    newCoordinate[1] - HIGHLIGHT_RECT_ORIGINAL_WORLD[1],
  ]);

  PATTERN_WASM_HANDLE.set_highlight_offset(worldUpdate[0], worldUpdate[1]);
  updateCanvasData(PATTERN_WASM_HANDLE);
}

export function updateScalingDisplay(rect: fabric.Rect) {
  if (RECT_WORLD_COORDS == null || SCALING_ANCHOR == null || PATTERN_WASM_HANDLE == undefined) return;

  const [anchorX, anchorY] = SCALING_ANCHOR;
  PATTERN_WASM_HANDLE.set_highlight_scale(rect.scaleX, rect.scaleY);
  PATTERN_WASM_HANDLE.set_highlight_flip(rect.flipX, rect.flipY);
  PATTERN_WASM_HANDLE.set_highlight_anchor(anchorX, anchorY);

  updateCanvasData(PATTERN_WASM_HANDLE);
}

export function updateRotatingDisplay(rect: fabric.Rect) {
  if (RECT_WORLD_COORDS == null || PATTERN_WASM_HANDLE == undefined) return;
  const [rotCenterX, rotCenterY] = getRotationCenter();

  PATTERN_WASM_HANDLE.set_highlight_rotation_center(rotCenterX, rotCenterY);
  PATTERN_WASM_HANDLE.set_highlight_rotation_angle(rect.angle * (Math.PI / 180));

  updateCanvasData(PATTERN_WASM_HANDLE);
}

export function setNewHighlightRect(rect: fabric.Rect) {
  if (HIGHLIGHT_RECT_ORIGINAL_WORLD == null || RECT_WORLD_COORDS == null || PATTERN_WASM_HANDLE == undefined) {
    setRectIsScaling(false);
    return;
  }

  if (RECT_IS_SCALING && SCALING_ANCHOR !== null) {
    setRectIsScaling(false);
    const [anchorX, anchorY] = SCALING_ANCHOR;

    PATTERN_WASM_HANDLE.set_highlight_scale(rect.scaleX, rect.scaleY);
    PATTERN_WASM_HANDLE.set_highlight_flip(rect.flipX, rect.flipY);
    PATTERN_WASM_HANDLE.set_highlight_anchor(anchorX, anchorY);
    PATTERN_WASM_HANDLE.scale_highlights();
    updateCanvasData(PATTERN_WASM_HANDLE);

    scaleHighlightRect([rect.scaleX, rect.scaleY], [rect.flipX, rect.flipY], [anchorX, anchorY]); // Update JS side rect world coordinates
    resetScaleRect(); // Apply transform to visual rect
    setRectOriginalWoordCoord(getDxfWorldCoorindates(rect.left, rect.top));
  } else if (rect.angle != 0) {
    const [rotCenterX, rotCenterY] = getRotationCenter();

    PATTERN_WASM_HANDLE.set_highlight_rotation_center(rotCenterX, rotCenterY);
    PATTERN_WASM_HANDLE.set_highlight_rotation_angle(rect.angle * (Math.PI / 180));
    const bbox = PATTERN_WASM_HANDLE.rotate_highlights();
    updateCanvasData(PATTERN_WASM_HANDLE);

    setRectWorldCoords(bbox);
    addHighlightBbox(bbox);
    setRectOriginalWoordCoord(getDxfWorldCoorindates(rect.left, rect.top));
  } else {
    const newCoordinate = getDxfWorldCoorindates(rect.left, rect.top);
    const worldUpdate = [
      newCoordinate[0] - HIGHLIGHT_RECT_ORIGINAL_WORLD[0],
      newCoordinate[1] - HIGHLIGHT_RECT_ORIGINAL_WORLD[1],
    ] as [number, number];

    PATTERN_WASM_HANDLE.set_highlight_offset(worldUpdate[0], worldUpdate[1]);
    PATTERN_WASM_HANDLE.offset_highlights(); // Update coordinates in pattern and reset
    updateCanvasData(PATTERN_WASM_HANDLE);

    addHighlightBbox(offsetHighlightRect(worldUpdate)); // Apply transform to visual rect
    setRectOriginalWoordCoord(getDxfWorldCoorindates(rect.left, rect.top)); // Reset record of current top left
  }
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

    if (HIGHLIGHT_RECT) {
      setRectOriginalWoordCoord(getDxfWorldCoorindates(HIGHLIGHT_RECT.left, HIGHLIGHT_RECT.top));

      HIGHLIGHT_RECT.on('moving', function (e) {
        if (e.transform) updateOffsetDisplay(e.transform.target as fabric.Rect);
      });
      HIGHLIGHT_RECT.on('scaling', function (e) {
        if (e.transform) {
          setRectIsScaling(true);
          updateScalingAnchor(e.transform.corner);
          updateScalingDisplay(e.transform.target as fabric.Rect);
        }
      });
      HIGHLIGHT_RECT.on('rotating', function (e) {
        if (e.transform) updateRotatingDisplay(e.transform.target as fabric.Rect);
      });
      HIGHLIGHT_RECT.on('modified', function (e) {
        if (e.transform) setNewHighlightRect(e.transform.target as fabric.Rect);
      });
    }
  }

  updateSelection(blockKeys);
  addChangeSelectionCallbacks(PATTERN_WASM_HANDLE, blockKeys);
}
