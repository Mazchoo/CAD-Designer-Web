import { mat4, vec3 } from 'wgpu-matrix';
import {
  squareVertexSize,
  squarePositionOffset,
  squareColorOffset,
  indexArray,
  squareVertexArray,
} from './meshes/square';
import { WASDCamera } from './camera';
import { createInputHandler, getCanvasCoordinates } from './input';
import { quitIfWebGPUNotAvailable } from './util';
import { program as linesWGSL } from './shaders/lines';
import { setDevice, mapBuffersToDevice, getBuffers } from './buffers';
import { startUpWasm } from './patternHandle';
import { CURRENT_ACTION, ACTION_TYPES, setupSelectBlockAction, setupNoneAction, performAction } from './action';

import { uploadJSON, readJsonToWasm } from './parseJson';

// Assign these two functions to the global scope
(window as any).uploadJSON = uploadJSON;
(window as any).readJsonToWasm = readJsonToWasm;
(window as any).setupSelectBlockAction = setupSelectBlockAction;
(window as any).setupNoneAction = setupNoneAction;

const WASAM_INIT = startUpWasm();

// ToDo make a helper program that copies shaders into ts files

const CANVAS = document.querySelector('canvas') as HTMLCanvasElement;

// The input handler
const INPUT_HANDLER = createInputHandler(window, CANVAS);

// The camera types
const INIT_CAMERA_POSITION = vec3.create(0, 0, 100);
const CAMERA = new WASDCamera({ position: INIT_CAMERA_POSITION });

const ADAPTER = await navigator.gpu?.requestAdapter();
const DEVICE = (await ADAPTER?.requestDevice()) as GPUDevice;
quitIfWebGPUNotAvailable(ADAPTER, DEVICE);
const CONTEXT = CANVAS.getContext('webgpu') as GPUCanvasContext;

const PRESENTATION_FORMAT = navigator.gpu.getPreferredCanvasFormat();

CONTEXT.configure({
  device: DEVICE,
  format: PRESENTATION_FORMAT,
  alphaMode: 'premultiplied',
});

setDevice(DEVICE);
mapBuffersToDevice(squareVertexArray, indexArray);

const LINES_COMPILED_SHADER = DEVICE.createShaderModule({ code: linesWGSL });

const bindGroupLayout = DEVICE.createBindGroupLayout({
  entries: [
    {
      binding: 0, // Binding index 0 for the uniform buffer
      visibility: GPUShaderStage.VERTEX,
      buffer: { type: 'uniform' },
    },
  ],
});

const LINE_DRAW_PIPELINE = DEVICE.createRenderPipeline({
  layout: DEVICE.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
  vertex: {
    module: LINES_COMPILED_SHADER,
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
    module: LINES_COMPILED_SHADER,
    targets: [
      {
        format: PRESENTATION_FORMAT,
      },
    ],
  },
  primitive: {
    topology: 'line-strip',
    stripIndexFormat: 'uint32',
    cullMode: 'none',
  },
});

const UNIFORM_BUFFER_SIZE = 32 * 16; // 4x4 matrix
const UNIFORM_BUFFER = DEVICE.createBuffer({
  size: UNIFORM_BUFFER_SIZE,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const UNIFORM_BIND_GROUP = DEVICE.createBindGroup({
  layout: LINE_DRAW_PIPELINE.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: {
        buffer: UNIFORM_BUFFER,
      },
    },
  ],
});

const RENDER_PASS_DESCRIPTOR = {
  colorAttachments: [
    {
      view: undefined, // Assigned later

      clearValue: [0.9, 0.9, 0.9, 1.0],
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
} as GPURenderPassDescriptor;

const FIELD_OF_VIEW_RAD = (2 * Math.PI) / 5;
const SIN_FIELD_OF_VIEW = Math.sin(FIELD_OF_VIEW_RAD); // Cached for efficiency
let PROJECTION_MATRIX = mat4.create();
function updateProjectionMatrix() {
  const devicePixelRatio = window.devicePixelRatio;
  CANVAS.width = CANVAS.clientWidth * devicePixelRatio;
  CANVAS.height = CANVAS.clientHeight * devicePixelRatio;
  const aspect = CANVAS.width / CANVAS.height;
  PROJECTION_MATRIX = mat4.perspective(FIELD_OF_VIEW_RAD, aspect, 0.1, 10000.0);
  return PROJECTION_MATRIX;
}
updateProjectionMatrix();

const MODEL_VIEW_PROJECTION_MATRIX = mat4.create();
function getModelViewProjectionMatrix(deltaTime: number) {
  const viewMatrix = CAMERA.update(deltaTime, INPUT_HANDLER());
  mat4.multiply(PROJECTION_MATRIX, viewMatrix, MODEL_VIEW_PROJECTION_MATRIX);
  return MODEL_VIEW_PROJECTION_MATRIX;
}

let LAST_FRAME_MS = Date.now();

function frame() {
  const now = Date.now();
  const deltaTime = (now - LAST_FRAME_MS) / 1000;
  LAST_FRAME_MS = now;
  // console.log(deltaTime * 1000);

  const modelViewProjection = getModelViewProjectionMatrix(deltaTime);
  DEVICE.queue.writeBuffer(
    UNIFORM_BUFFER,
    0,
    modelViewProjection.buffer,
    modelViewProjection.byteOffset,
    modelViewProjection.byteLength
  );
  (RENDER_PASS_DESCRIPTOR.colorAttachments as GPURenderPassColorAttachment[])[0].view =
    CONTEXT.getCurrentTexture().createView();

  const commandEncoder = DEVICE.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(RENDER_PASS_DESCRIPTOR);

  const buffers = getBuffers();
  if (buffers !== undefined) {
    const [verticesBuffer, indexBuffer, nrIndices] = buffers;

    passEncoder.setBindGroup(0, UNIFORM_BIND_GROUP);
    passEncoder.setPipeline(LINE_DRAW_PIPELINE);
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.setIndexBuffer(indexBuffer, 'uint32');
    passEncoder.drawIndexed(nrIndices, 1, 0, 0, 0);
    passEncoder.end();
    DEVICE.queue.submit([commandEncoder.finish()]);
  }

  requestAnimationFrame(frame);
}

window.addEventListener(
  'resize',
  (e) => {
    console.log('Window resized');
    updateProjectionMatrix();
  },
  true
);

CANVAS.addEventListener(
  'click',
  (e) => {
    if (CURRENT_ACTION === ACTION_TYPES.NONE) {
      return;
    }
    const [eventX, eventY] = getCanvasCoordinates(e, CANVAS);

    // Use orthonormal assumption of camera
    const xScale = PROJECTION_MATRIX[0];
    const yScale = PROJECTION_MATRIX[5];
    const cameraDist = CAMERA.position[2];
    const actionPoint: [number, number] = [
      (eventX / xScale) * cameraDist * SIN_FIELD_OF_VIEW + CAMERA.position[0],
      (-eventY / yScale) * cameraDist * SIN_FIELD_OF_VIEW + CAMERA.position[1],
    ];

    performAction(actionPoint);
  },
  { passive: false }
);

// Start app
await WASAM_INIT;
requestAnimationFrame(frame);
