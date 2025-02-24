// Process user events on canvas
import { GPU_CANVAS } from './globals';
import { CURRENT_ACTION, ACTION_TYPES, performAction } from './action';
import { FABRIC_CANVAS_HANDLER, clearFabricCanvas, updateFabricCanvasHeightWidth } from './fabricHandle';
import { getDxfWorldCoorindates, updateProjectionMatrix } from './rendering';

window.addEventListener(
  'resize',
  (e) => {
    updateFabricCanvasHeightWidth(GPU_CANVAS.clientHeight, GPU_CANVAS.clientWidth);
    updateProjectionMatrix();
  },
  true
);

FABRIC_CANVAS_HANDLER.on('mouse:down', (event) => {
  if (CURRENT_ACTION === ACTION_TYPES.PAN || event.target) {
    return;
  }
  clearFabricCanvas();
  const e = event.e as MouseEvent;
  const actionPoint = getDxfWorldCoorindates(e.clientX, e.clientY);
  console.log('down', actionPoint);
  performAction(actionPoint, true);
});

FABRIC_CANVAS_HANDLER.on('mouse:up', (event) => {
  if (CURRENT_ACTION === ACTION_TYPES.PAN || event.target) {
    return;
  }
  const e = event.e as MouseEvent;
  const actionPoint = getDxfWorldCoorindates(e.clientX, e.clientY);
  console.log('up', actionPoint);
  performAction(actionPoint, false);
});
