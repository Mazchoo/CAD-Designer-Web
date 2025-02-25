// ToDo - Add function here to get from normalised back to original coordinates

export function getNormalisedCanvasCoordinates(mouseX: number, mouseY: number, canvas: HTMLElement): [number, number] {
  const rect = canvas.getBoundingClientRect();
  // ToDo - try caching this and updating on resize
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;
  const eventX = ((mouseX - centerX) / (rect.right - rect.left)) * 2;
  const eventY = ((mouseY - centerY) / (rect.bottom - rect.top)) * 2;
  return [eventX, eventY];
}
