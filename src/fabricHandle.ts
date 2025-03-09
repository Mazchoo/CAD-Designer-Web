import * as fabric from 'fabric';

export const FABRIC_CANVAS_HANDLER = new fabric.Canvas('fabric-canvas', {
  preserveObjectStacking: true,
});

export let HIGHLIGHT_RECT: fabric.Rect | null = null;
export let HIGHLIGHT_RECT_ORIGINAL_WORLD: [number, number] | null = null;
export let RECT_WORLD_COORDS: [[number, number], [number, number]] | null = null;
export let RECT_IS_SCALING: boolean = false;
export let SCALING_ANCHOR: [number, number] | null = null;

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
  rect.set({ top: minY, left: minX, width: maxX - minX, height: maxY - minY, angle: 0 });
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
  if (HIGHLIGHT_RECT === null) return;
  FABRIC_CANVAS_HANDLER.clear();
  HIGHLIGHT_RECT = null;
  RECT_WORLD_COORDS = null;
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

export function highlightRectIsBeingEdited(): boolean {
  if (HIGHLIGHT_RECT == null) return false;
  return HIGHLIGHT_RECT.isMoving || RECT_IS_SCALING || HIGHLIGHT_RECT.__corner === 'mtr';
}

export function setRectOriginalWoordCoord(coord: [number, number]) {
  HIGHLIGHT_RECT_ORIGINAL_WORLD = coord;
}

export function setRectIsScaling(scaling: boolean) {
  RECT_IS_SCALING = scaling;
}

export function offsetHighlightRect(offset: [number, number]): [[number, number], [number, number]] {
  if (RECT_WORLD_COORDS === null) {
    return [
      [0, 0],
      [0, 0],
    ];
  }
  RECT_WORLD_COORDS = [
    [RECT_WORLD_COORDS[0][0] + offset[0], RECT_WORLD_COORDS[0][1] + offset[0]],
    [RECT_WORLD_COORDS[1][0] + offset[1], RECT_WORLD_COORDS[1][1] + offset[1]],
  ] as [[number, number], [number, number]];
  return RECT_WORLD_COORDS;
}

export function scaleHighlightRect(
  scale: [number, number],
  flip: [boolean, boolean],
  anchor: [number, number]
): [[number, number], [number, number]] {
  if (RECT_WORLD_COORDS === null) {
    return [
      [0, 0],
      [0, 0],
    ];
  }
  RECT_WORLD_COORDS[0][0] -= anchor[0];
  RECT_WORLD_COORDS[0][1] -= anchor[0];
  RECT_WORLD_COORDS[1][0] -= anchor[1];
  RECT_WORLD_COORDS[1][1] -= anchor[1];

  RECT_WORLD_COORDS[0][0] *= scale[0];
  RECT_WORLD_COORDS[0][1] *= scale[0];
  RECT_WORLD_COORDS[1][0] *= scale[1];
  RECT_WORLD_COORDS[1][1] *= scale[1];

  if (flip[0]) {
    RECT_WORLD_COORDS[0][0] *= -1;
    RECT_WORLD_COORDS[0][1] *= -1;
  }
  if (flip[1]) {
    RECT_WORLD_COORDS[1][0] *= -1;
    RECT_WORLD_COORDS[1][1] *= -1;
  }

  RECT_WORLD_COORDS[0][0] += anchor[0];
  RECT_WORLD_COORDS[0][1] += anchor[0];
  RECT_WORLD_COORDS[1][0] += anchor[1];
  RECT_WORLD_COORDS[1][1] += anchor[1];

  return RECT_WORLD_COORDS;
}

export function resetScaleRect() {
  if (HIGHLIGHT_RECT == null) {
    return;
  }

  HIGHLIGHT_RECT.set({
    width: HIGHLIGHT_RECT.width * HIGHLIGHT_RECT.scaleX,
    height: HIGHLIGHT_RECT.height * HIGHLIGHT_RECT.scaleY,
    scaleX: 1,
    scaleY: 1,
    flipX: false,
    flipY: false,
  });

  SCALING_ANCHOR = null;
  HIGHLIGHT_RECT.setCoords();
  FABRIC_CANVAS_HANDLER.requestRenderAll();
}

function getScalingAnchor(corner: string): [number, number] {
  if (RECT_WORLD_COORDS === null) return [0, 0];

  let anchorX = RECT_WORLD_COORDS[0][0];
  let anchorY = RECT_WORLD_COORDS[1][0];

  switch (corner) {
    case 'tl':
      anchorX = RECT_WORLD_COORDS[0][1];
      anchorY = RECT_WORLD_COORDS[1][0];
      break;
    case 'tr': // Top-right is moving → anchor at bottom-left
      anchorX = RECT_WORLD_COORDS[0][0];
      anchorY = RECT_WORLD_COORDS[1][0];
      break;
    case 'bl': // Bottom-left is moving → anchor at top-right
      anchorX = RECT_WORLD_COORDS[0][1];
      anchorY = RECT_WORLD_COORDS[1][1];
      break;
    case 'br': // Bottom-right is moving → anchor at top-left
      anchorX = RECT_WORLD_COORDS[0][0];
      anchorY = RECT_WORLD_COORDS[1][1];
      break;
    case 'ml': // Middle-left is moving → anchor at middle-right
      anchorX = RECT_WORLD_COORDS[0][1];
      anchorY = 1.5 * RECT_WORLD_COORDS[1][0] + 0.5 * RECT_WORLD_COORDS[1][1];
      break;
    case 'mr': // Middle-right is moving → anchor at middle-left
      anchorX = RECT_WORLD_COORDS[0][0];
      anchorY = 1.5 * RECT_WORLD_COORDS[1][0] + 0.5 * RECT_WORLD_COORDS[1][1];
      break;
    case 'mt': // Middle-top is moving → anchor at middle-bottom
      anchorX = 1.5 * RECT_WORLD_COORDS[0][0] + 0.5 * RECT_WORLD_COORDS[0][1];
      anchorY = RECT_WORLD_COORDS[1][0];
      break;
    case 'mb': // Middle-bottom is moving → anchor at middle-top
      anchorX = 1.5 * RECT_WORLD_COORDS[0][0] + 0.5 * RECT_WORLD_COORDS[0][1];
      anchorY = RECT_WORLD_COORDS[1][1];
      break;
  }

  return [anchorX, anchorY];
}

export function updateScalingAnchor(corner: string): [number, number] {
  if (SCALING_ANCHOR != null) return SCALING_ANCHOR;
  SCALING_ANCHOR = getScalingAnchor(corner);
  return SCALING_ANCHOR;
}

export function getRotationCenter(): [number, number] {
  if (RECT_WORLD_COORDS === null) return [0, 0];
  return [
    (RECT_WORLD_COORDS[0][0] + RECT_WORLD_COORDS[0][1]) / 2,
    (RECT_WORLD_COORDS[1][0] + RECT_WORLD_COORDS[1][1]) / 2,
  ];
}
