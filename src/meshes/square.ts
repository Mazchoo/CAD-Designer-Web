export const squareVertexSize = 4 * 6; // Byte size of one cube vertex.
export const squarePositionOffset = 0;
export const squareColorOffset = 4 * 2; // Byte offset of cube vertex color attribute.
export const squareVertexCount = 5;

// prettier-ignore
export const squareVertexArray = new Float32Array([
  // float2 position, float4 color,
  -0.5, -0.5, 0., 0., 0., 1.,
  0.5, -0.5, 0., 0., 0., 1.,
  0.5,  0.5, 0., 0., 0., 1.,
 -0.5,  0.5, 0., 0., 0., 1.,
 -0.5, -0.5, 0., 0., 0., 1.
]);
