export const squareVertexSize = 4 * 6; // Byte size of one cube vertex.
export const squarePositionOffset = 0;
export const squareColorOffset = 4 * 2; // Byte offset of cube vertex color attribute.

// prettier-ignore
export const squareVertexArray = new Float32Array([
  // float2 position, float4 color,
  -0.5, -0.5, 0., 0., 0., 1.,
  0.5, -0.5, 0., 0., 0., 1.,
  0.5,  0.5, 0., 0., 0., 1.,
 -0.5,  0.5, 0., 0., 0., 1.,
 -0.5, -0.5, 0., 0., 0., 1.,
 -1.5, -1.5, 0., 0., 0., 1.,
 1.5, -1.5, 0., 0., 0., 1.,
 1.5,  1.5, 0., 0., 0., 1.,
-1.5,  1.5, 0., 0., 0., 1.,
-1.5, -1.5, 0., 0., 0., 1.,
-0.6, -0.6, 0., 0., 0., 1.,
-0.4, -0.6, 0.05, 0.05, 0.05, 1.,
-0.4, -0.4, 0.1, 0.1, 0.1, 1.,
-0.6, -0.4, 0.05, 0.05, 0.05, 1.,
]);

export const linesIndexArray = new Uint16Array([0, 1, 2, 3, 4, 0xFFFF, 5, 6, 7, 8, 9, 0xFFFF]); // Needs even length
export const pointsIndexArray = new Uint16Array([10, 11, 12, 13, 10, 12]);

