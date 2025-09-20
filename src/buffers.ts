let verticesBuffer: GPUBuffer | undefined;
let indexBuffer: GPUBuffer | undefined;
let nrIndices: number | undefined;
let currentDevice: GPUDevice | undefined;

export function setDevice(device: GPUDevice) {
  currentDevice = device;
}

export function mapBuffersToDevice(vertexArray: Float32Array, indexArray: Uint32Array) {
  if (currentDevice === undefined) {
    console.error('No device has been set');
    return;
  }

  if (verticesBuffer) verticesBuffer.destroy();
  if (indexBuffer) indexBuffer.destroy();

  verticesBuffer = currentDevice.createBuffer({
    size: vertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  currentDevice.queue.writeBuffer(
    verticesBuffer,
    0,
    vertexArray.buffer,
    vertexArray.byteOffset,
    vertexArray.byteLength
  );

  indexBuffer = currentDevice.createBuffer({
    size: indexArray.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  currentDevice.queue.writeBuffer(indexBuffer, 0, indexArray.buffer, indexArray.byteOffset, indexArray.byteLength);

  nrIndices = indexArray.length;
}

export function getBuffers(): [GPUBuffer, GPUBuffer, number] | undefined {
  if (verticesBuffer === undefined || indexBuffer === undefined || nrIndices == undefined) {
    console.error('Requested buffer not defined yet');
    return undefined;
  }
  return [verticesBuffer, indexBuffer, nrIndices];
}
