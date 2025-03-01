import * as fabric from 'fabric';

export const FABRIC_CANVAS_HANDLER = new fabric.Canvas('fabric-canvas', {
  preserveObjectStacking: true,
});

const CROSS_SVG = 'M -5 0 L 5 0 M 0 -5 L 0 5';

export let HIGHLIGHT_RECT: fabric.Rect | null = null;
export let HIGHLIGHT_RECT_OFFSET: [number, number] | null = null;
export let RECT_WORLD_COORDS: [[number, number], [number, number]] | null = null;
export let HIGHLIGHT_ANCHOR: fabric.Path | null = null;
export let HIGHLIGHT_ANCHOR_OFFSET: [number, number] | null = null;
export let MARKER_WORLD_COORDS: [number, number] | null = null;
let MARKER_MOVED = false;

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

export function initialiseAnchor(x: number, y: number) {
  if (HIGHLIGHT_ANCHOR) return;

  HIGHLIGHT_ANCHOR = new fabric.Path(CROSS_SVG, {
    left: x - 5,
    top: y - 5,
    stroke: 'black',
    strokeWidth: 1,
    originX: 'center',
    originY: 'center',
    selectable: true,
    hasControls: false,
    hasBorders: true,
  });

  FABRIC_CANVAS_HANDLER.add(HIGHLIGHT_ANCHOR);
  FABRIC_CANVAS_HANDLER.requestRenderAll();
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

function updateAnchor(anchor: fabric.Path, x: number, y: number) {
  anchor.set({ top: y - 5, left: x - 5 });
  anchor.setCoords();
  FABRIC_CANVAS_HANDLER.requestRenderAll();
}

export function createOrMoveAnchor(x: number, y: number) {
  if (HIGHLIGHT_ANCHOR !== null) {
    updateAnchor(HIGHLIGHT_ANCHOR, x, y);
  } else {
    initialiseAnchor(x, y);
  }
}

export function clearFabricCanvas() {
  console.log('Clear fabric canvas');
  if (HIGHLIGHT_RECT === null) return;
  FABRIC_CANVAS_HANDLER.clear();
  HIGHLIGHT_RECT = null;
  HIGHLIGHT_ANCHOR = null;
  RECT_WORLD_COORDS = null;
  MARKER_WORLD_COORDS = null;
  HIGHLIGHT_RECT_OFFSET = null;
  HIGHLIGHT_ANCHOR_OFFSET = null;
  MARKER_MOVED = false;
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
  if (HIGHLIGHT_ANCHOR) HIGHLIGHT_ANCHOR.set({ selectable: true });
}

export function disableSelection() {
  FABRIC_CANVAS_HANDLER.selection = false;
  if (HIGHLIGHT_RECT) HIGHLIGHT_RECT.set({ selectable: false });
  if (HIGHLIGHT_ANCHOR) HIGHLIGHT_ANCHOR.set({ selectable: false });
}

export function setRectWorldCoords(coords: [[number, number], [number, number]]) {
  RECT_WORLD_COORDS = coords;
}

export function setMarkerWorldCoords(coords: [number, number]) {
  MARKER_WORLD_COORDS = coords;
}

export function highlightRectIsMoving(): boolean {
  if (HIGHLIGHT_RECT == null) return false;
  return HIGHLIGHT_RECT.isMoving || HIGHLIGHT_RECT.__corner === 'mtr';
}

export function highlightMarkerIsMoving(): boolean {
  if (HIGHLIGHT_ANCHOR == null) return false;
  return Boolean(HIGHLIGHT_ANCHOR.isMoving);
}

export function setRectOriginalWoordCoord(coord: [number, number]) {
  HIGHLIGHT_RECT_OFFSET = coord;
}
