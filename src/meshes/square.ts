export const LINES_VERTEX_SIZE = 4 * 3; // 8 bytes for position, 4 bytes for color
export const LINES_POSITION_OFFSET = 0;
export const LINES_COLOR_OFFSET = 4 * 2; // Byte offset of cube vertex color attribute.

function floatColor(r: number, g: number, b: number, a: number): number {
  let packed = (r << 24) | (g << 16) | (b << 8) | a;
  let buffer = new ArrayBuffer(4);
  new Uint32Array(buffer)[0] = packed;
  return new Float32Array(buffer)[0];
}

// prettier-ignore
export const squareVertexArray = new Float32Array([
  // float2 position, float color,
  -0.5, -0.5, floatColor(0, 0, 0, 255),
  0.5, -0.5, floatColor(0, 0, 0, 255),
  0.5,  0.5, floatColor(0, 0, 0, 255),
 -0.5,  0.5, floatColor(0, 0, 0, 255),
 -1.5, -1.5, floatColor(0, 0, 0, 255),
 1.5, -1.5, floatColor(0, 0, 0, 255),
 1.5,  1.5, floatColor(0, 0, 0, 255),
-1.5,  1.5, floatColor(0, 0, 0, 255),
-0.6, -0.6, floatColor(0, 0, 0, 255),
-0.4, -0.4, floatColor(25, 25, 25, 255),
-0.4, -0.6, floatColor(13, 13, 13, 255),
-0.6, -0.4, floatColor(13, 13, 13, 255),
 1500, -1500, floatColor(0, 0, 0, 255),
 1500,  1500, floatColor(0, 0, 0, 255),
-1500,  1500, floatColor(0, 0, 0, 255),
-1500, -1500, floatColor(0, 0, 0, 255),
]);

export const indexArray = new Uint32Array([
  0, 1, 2, 3, 0, 0xffffffff, 4, 5, 6, 7, 4, 0xffffffff, 8, 9, 0xffffffff, 10, 11, 0xffffffff, 12, 13, 14, 15, 12,
]);
