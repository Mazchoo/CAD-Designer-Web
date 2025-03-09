// Components on JS screen
import { createInputHandler } from './input';

export const GPU_CANVAS = document.getElementById('wgpu-canvas') as HTMLCanvasElement;
export const EVENT_CANVAS = document.getElementById('canvas-container') as HTMLCanvasElement;
export const INPUT_HANDLER = createInputHandler(window, EVENT_CANVAS);

export const EPS = 1e-9;
