// Interface between JS and TS
import { setupSelectBlockAction, setupPanAction } from './action';
import { uploadJSON, readJsonToWasm } from './parseJson';
import { createInputHandler } from './input';

// Assign these functions to the global scope for JS
(window as any).uploadJSON = uploadJSON;
(window as any).readJsonToWasm = readJsonToWasm;
(window as any).setupSelectBlockAction = setupSelectBlockAction;
(window as any).setupPanAction = setupPanAction;

export const GPU_CANVAS = document.getElementById('wgpu-canvas') as HTMLCanvasElement;
export const EVENT_CANVAS = document.getElementById('canvas-container') as HTMLCanvasElement;
export const INPUT_HANDLER = createInputHandler(window, EVENT_CANVAS);
