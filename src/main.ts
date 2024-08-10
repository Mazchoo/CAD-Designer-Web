import { mat4, vec3 } from 'wgpu-matrix';
import {
  squareVertexSize,
  squarePositionOffset,
  squareColorOffset,
  squareVertexArray,
  squareVertexCount,
} from './meshes/square';
import { WASDCamera } from './camera';
import { createInputHandler } from './input';
import { quitIfWebGPUNotAvailable } from './util';
import { program as squareWGSL } from './shaders/square';
// ToDo make a helper program that copies shaders into ts files

// ToDo make a mock canvas when debugging locally
const canvas = document.querySelector('canvas') as HTMLCanvasElement;

// The input handler
const inputHandler = createInputHandler(window, canvas);

// The camera types
const initialCameraPosition = vec3.create(0, 0, 2);
const camera = new WASDCamera({ position: initialCameraPosition });

const adapter = await navigator.gpu?.requestAdapter();
const device = (await adapter?.requestDevice()) as GPUDevice;
quitIfWebGPUNotAvailable(adapter, device);
const context = canvas.getContext('webgpu') as GPUCanvasContext;

const devicePixelRatio = window.devicePixelRatio;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
  device,
  format: presentationFormat,
  alphaMode: 'premultiplied',
});

// Create a vertex buffer from the cube data.
const verticesBuffer = device.createBuffer({
  size: squareVertexArray.byteLength,
  usage: GPUBufferUsage.VERTEX,
  mappedAtCreation: true,
});
new Float32Array(verticesBuffer.getMappedRange()).set(squareVertexArray);
verticesBuffer.unmap();
const compiledShader = device.createShaderModule({ code: squareWGSL });

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: compiledShader,
    buffers: [
      {
        arrayStride: squareVertexSize,
        attributes: [
          {
            shaderLocation: 0,
            offset: squarePositionOffset,
            format: 'float32x2',
          },
          {
            shaderLocation: 1,
            offset: squareColorOffset,
            format: 'float32x4',
          },
        ],
      },
    ],
  },
  fragment: {
    module: compiledShader,
    targets: [
      {
        format: presentationFormat,
      },
    ],
  },
  primitive: {
    topology: 'line-strip',
    stripIndexFormat: 'uint32',
    cullMode: 'none',
  },
});

const uniformBufferSize = 4 * 16; // 4x4 matrix
const uniformBuffer = device.createBuffer({
  size: uniformBufferSize,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const uniformBindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: {
        buffer: uniformBuffer,
      },
    },
  ],
});

const renderPassDescriptor = {
  colorAttachments: [
    {
      view: undefined, // Assigned later

      clearValue: [0.9, 0.9, 0.9, 1.0],
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
} as GPURenderPassDescriptor;

const aspect = canvas.width / canvas.height;
const projectionMatrix = mat4.perspective((2 * Math.PI) / 5, aspect, 0.1, 100.0);
const modelViewProjectionMatrix = mat4.create();

function getModelViewProjectionMatrix(deltaTime: number) {
  const viewMatrix = camera.update(deltaTime, inputHandler());
  mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);
  return modelViewProjectionMatrix;
}

let lastFrameMS = Date.now();

function frame() {
  const now = Date.now();
  const deltaTime = (now - lastFrameMS) / 1000;
  lastFrameMS = now;

  const modelViewProjection = getModelViewProjectionMatrix(deltaTime);
  device.queue.writeBuffer(
    uniformBuffer,
    0,
    modelViewProjection.buffer,
    modelViewProjection.byteOffset,
    modelViewProjection.byteLength
  );
  (renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = context
    .getCurrentTexture()
    .createView();

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, uniformBindGroup);
  passEncoder.setVertexBuffer(0, verticesBuffer);
  passEncoder.draw(squareVertexCount);
  passEncoder.end();
  device.queue.submit([commandEncoder.finish()]);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
