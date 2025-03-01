import * as fabric from 'fabric';

export const FABRIC_CANVAS_HANDLER = new fabric.Canvas('fabric-canvas', {
  preserveObjectStacking: true,
});

export let HIGHLIGHT_RECT: fabric.Rect | null = null;
export let HIGHLIGHT_RECT_ORIGINAL_WORLD: [number, number] | null = null;
export let RECT_WORLD_COORDS: [[number, number], [number, number]] | null = null;
export let MARKER_WORLD_COORDS: [number, number] | null = null;

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
  return HIGHLIGHT_RECT.isMoving || HIGHLIGHT_RECT.__corner === 'mtr';
}

export function setRectOriginalWoordCoord(coord: [number, number]) {
  HIGHLIGHT_RECT_ORIGINAL_WORLD = coord;
}

// ToDo - fix chat gpt rubbish
export function getAbsoluteTopLeft(rect: fabric.Rect): [number, number] {
  const bounds = rect.getBoundingRect();
  const canvasWidth = FABRIC_CANVAS_HANDLER.width;
  const canvasHeight = FABRIC_CANVAS_HANDLER.height;

  const corners = {
    topLeft: [bounds.left, bounds.top],
    topRight: [bounds.left + bounds.width, bounds.top],
    bottomLeft: [bounds.left, bounds.top + bounds.height],
    bottomRight: [bounds.left + bounds.width, bounds.top + bounds.height],
  };
  let selectedCorner = null;

  // Find the first visible corner
  for (const [cornerName, pos] of Object.entries(corners)) {
    if (pos[0] >= 0 && pos[0] <= canvasWidth && pos[1] >= 0 && pos[1] <= canvasHeight) {
      selectedCorner = { name: cornerName, pos };
      break;
    }
  }

  if (!selectedCorner) {
    console.log('All corners are clipped, returning default top-left.');
    return corners.topLeft as [number, number];
  }

  const { name, pos } = selectedCorner;
  let topLeftX = pos[0];
  let topLeftY = pos[1];

  if (name === 'topRight') {
    topLeftX -= bounds.width;
  } else if (name === 'bottomLeft') {
    topLeftY -= bounds.height;
  } else if (name === 'bottomRight') {
    topLeftX -= bounds.width;
    topLeftY -= bounds.height;
  }
  return [topLeftX, topLeftY];
}
