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

  verticesBuffer = currentDevice.createBuffer({
    size: vertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(verticesBuffer.getMappedRange()).set(vertexArray);
  verticesBuffer.unmap();

  indexBuffer = currentDevice.createBuffer({
    size: indexArray.byteLength,
    usage: GPUBufferUsage.INDEX,
    mappedAtCreation: true,
  });
  new Uint32Array(indexBuffer.getMappedRange()).set(indexArray);
  indexBuffer.unmap();

  nrIndices = indexArray.length;
}

export function getBuffers(): [GPUBuffer, GPUBuffer, number] | undefined {
  if (verticesBuffer === undefined || indexBuffer === undefined || nrIndices == undefined) {
    console.error('Requested buffer not defined yet');
    return undefined;
  }
  return [verticesBuffer, indexBuffer, nrIndices];
}
