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

export function getPixelCoorindates(cameraPoint: [number, number]): [number, number] {
  return [(cameraPoint[0] + 1) * WIDTH_HEIGHT_HALF[0], (cameraPoint[1] + 1) * WIDTH_HEIGHT_HALF[1]];
}
