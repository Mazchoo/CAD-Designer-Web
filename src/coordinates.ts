// ToDo - Add function here to get from normalised back to original coordinates

let CENTER = [0, 0];
let WIDTH_HEIGHT_HALF = [1, 1];

export function updateCenterWidthHeight(canvas: HTMLElement) {
  const rect = canvas.getBoundingClientRect();
  CENTER[0] = (rect.left + rect.right) / 2;
  CENTER[1] = (rect.top + rect.bottom) / 2;
  WIDTH_HEIGHT_HALF[0] = (rect.right - rect.left) * 0.5;
  WIDTH_HEIGHT_HALF[1] = (rect.bottom - rect.top) * 0.5;
}

export function getNormalisedCanvasCoordinates(mouseX: number, mouseY: number): [number, number] {
  return [(mouseX - CENTER[0]) / WIDTH_HEIGHT_HALF[0], (mouseY - CENTER[1]) / WIDTH_HEIGHT_HALF[1]];
}

export function getPixelCoorindates(cameraX: number, cameraY: number): [number, number] {
  const clampedX = Math.min(Math.max(cameraX, -1), 1);
  const clampedY = Math.min(Math.max(cameraY, -1), 1);
  return [clampedX * WIDTH_HEIGHT_HALF[0] + CENTER[0], clampedY * WIDTH_HEIGHT_HALF[1] + CENTER[1]];
}
