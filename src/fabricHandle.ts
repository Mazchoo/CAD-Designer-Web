import * as fabric from 'fabric';

export const FABRIC_CANVAS_HANDLER = new fabric.Canvas('fabric-canvas', {
  preserveObjectStacking: true,
});

export let HIGHLIGHT_RECT: fabric.Rect | null = null;
export let HIGHLIGHT_RECT_ORIGINAL_WORLD: [number, number] | null = null;
export let RECT_WORLD_COORDS: [[number, number], [number, number]] | null = null;
export let MARKER_WORLD_COORDS: [number, number] | null = null;
export let RECT_IS_SCALING: boolean = false;

function inialiseRect(minX: number, minY: number, maxX: number, maxY: number) {
  HIGHLIGHT_RECT = new fabric.Rect({
    top: minY,
    left: minX,
    fill: 'transparent',
    stroke: 'blue',
    strokeWidth: 0.5,
    width: maxX - minX,
    height: maxY - minY,
    angle: 0,
    cornerSize: 8,
    selectable: true,
    hasControls: true,
    strokeUniform: true,
  });

  FABRIC_CANVAS_HANDLER.add(HIGHLIGHT_RECT);
  FABRIC_CANVAS_HANDLER.setActiveObject(HIGHLIGHT_RECT);
}

function updateRect(rect: fabric.Rect, minX: number, minY: number, maxX: number, maxY: number) {
  rect.set({ top: minY, left: minX, width: maxX - minX, height: maxY - minY });
  rect.setCoords();
  FABRIC_CANVAS_HANDLER.requestRenderAll();
}

export function createOrMoveRect(minX: number, minY: number, maxX: number, maxY: number) {
  if (HIGHLIGHT_RECT !== null) {
    updateRect(HIGHLIGHT_RECT, minX, minY, maxX, maxY);
  } else {
    inialiseRect(minX, minY, maxX, maxY);
  }
}

export function clearFabricCanvas() {
  console.log('Clear fabric canvas');
  if (HIGHLIGHT_RECT === null) return;
  FABRIC_CANVAS_HANDLER.clear();
  HIGHLIGHT_RECT = null;
  RECT_WORLD_COORDS = null;
  MARKER_WORLD_COORDS = null;
  HIGHLIGHT_RECT_ORIGINAL_WORLD = null;
  RECT_IS_SCALING = false;
}

export function initialiseFabricCanvas(height: number, width: number) {
  FABRIC_CANVAS_HANDLER.setDimensions({ height: height, width: width });
  FABRIC_CANVAS_HANDLER.selection = false;
}

export function updateFabricCanvasHeightWidth(height: number, width: number) {
  FABRIC_CANVAS_HANDLER.setDimensions({ height: height, width: width });
}

export function enableSelection() {
  FABRIC_CANVAS_HANDLER.selection = true;
  if (HIGHLIGHT_RECT) HIGHLIGHT_RECT.set({ selectable: true });
}

export function disableSelection() {
  FABRIC_CANVAS_HANDLER.selection = false;
  if (HIGHLIGHT_RECT) HIGHLIGHT_RECT.set({ selectable: false });
}

export function setRectWorldCoords(coords: [[number, number], [number, number]]) {
  RECT_WORLD_COORDS = coords;
}

export function highlightRectIsMoving(): boolean {
  if (HIGHLIGHT_RECT == null) return false;
  return HIGHLIGHT_RECT.isMoving || RECT_IS_SCALING || HIGHLIGHT_RECT.__corner === 'mtr';
}

export function setRectOriginalWoordCoord(coord: [number, number]) {
  HIGHLIGHT_RECT_ORIGINAL_WORLD = coord;
}

export function setRectIsScaling(scaling: boolean) {
  RECT_IS_SCALING = scaling;
}
