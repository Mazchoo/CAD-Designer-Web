// Define GPU rendering context
import { mat4, vec3 } from 'wgpu-matrix';
import { quitIfWebGPUNotAvailable } from './util';

import { program as linesWGSL } from './shaders/lines';
import {
  squareVertexSize,
  squarePositionOffset,
  squareColorOffset,
  indexArray,
  squareVertexArray,
} from './meshes/square';
import { WASDCamera } from './camera';
import { setDevice, mapBuffersToDevice } from './buffers';
import { getNormalisedCanvasCoordinates, getPixelCoorindates } from './coordinates';
import { GPU_CANVAS } from './globals';
import {
  initialiseFabricCanvas,
  createOrMoveRect,
  highlightRectIsBeingEdited,
  rectIsRotating,
  RECT_IS_SCALING,
  HIGHLIGHT_RECT,
} from './fabricHandle';
import Input from './input';

initialiseFabricCanvas(GPU_CANVAS.clientHeight, GPU_CANVAS.clientWidth);

// ToDo make a helper program that copies shaders into ts files

const INIT_CAMERA_POSITION = vec3.create(0, 0, -100);
export const CAMERA = new WASDCamera(INIT_CAMERA_POSITION);

const ADAPTER = await navigator.gpu?.requestAdapter();
export const DEVICE = (await ADAPTER?.requestDevice()) as GPUDevice;
quitIfWebGPUNotAvailable(ADAPTER, DEVICE);
export const CONTEXT = GPU_CANVAS.getContext('webgpu') as GPUCanvasContext;

const PRESENTATION_FORMAT = navigator.gpu.getPreferredCanvasFormat();

CONTEXT.configure({
  device: DEVICE,
  format: PRESENTATION_FORMAT,
  alphaMode: 'premultiplied',
});

setDevice(DEVICE);
mapBuffersToDevice(squareVertexArray, indexArray);

export const LINES_COMPILED_SHADER = DEVICE.createShaderModule({ code: linesWGSL });

const bindGroupLayout = DEVICE.createBindGroupLayout({
  entries: [
    {
      binding: 0, // Binding index 0 for the uniform buffer
      visibility: GPUShaderStage.VERTEX,
      buffer: { type: 'uniform' },
    },
  ],
});

export const LINE_DRAW_PIPELINE = DEVICE.createRenderPipeline({
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
export const UNIFORM_BUFFER = DEVICE.createBuffer({
  size: UNIFORM_BUFFER_SIZE,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

export const UNIFORM_BIND_GROUP = DEVICE.createBindGroup({
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

export const RENDER_PASS_DESCRIPTOR = {
  colorAttachments: [
    {
      view: undefined, // Assigned later

      clearValue: [0.9, 0.9, 0.9, 1.0],
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
} as GPURenderPassDescriptor;

const CANVAS_ADJUSTMENT = 0.95; // Not sure why but Web-GPU is not using the entire canvas range (-1, 1)
const FIELD_OF_VIEW_RAD = (2 * Math.PI) / 5;
const SIN_FIELD_OF_VIEW = Math.sin(FIELD_OF_VIEW_RAD); // Cached for efficiency

let PROJECTION_MATRIX = mat4.create();
export function updateProjectionMatrix() {
  const devicePixelRatio = window.devicePixelRatio;
  GPU_CANVAS.width = GPU_CANVAS.clientWidth * devicePixelRatio;
  GPU_CANVAS.height = GPU_CANVAS.clientHeight * devicePixelRatio;
  const aspect = GPU_CANVAS.width / GPU_CANVAS.height;
  PROJECTION_MATRIX = mat4.perspective(FIELD_OF_VIEW_RAD, aspect, 1.0, 10000.0);
  return PROJECTION_MATRIX;
}
updateProjectionMatrix();

const MODEL_VIEW_PROJECTION_MATRIX = mat4.create();
export function getModelViewProjectionMatrix(deltaTime: number, input: Input) {
  const ignoreZoom = highlightRectIsBeingEdited();
  const ignoreMoving = RECT_IS_SCALING || rectIsRotating();
  const viewMatrix = CAMERA.update(deltaTime, input, ignoreZoom, ignoreMoving);
  mat4.multiply(PROJECTION_MATRIX, viewMatrix, MODEL_VIEW_PROJECTION_MATRIX);
  return MODEL_VIEW_PROJECTION_MATRIX;
}

export function getDxfWorldCoorindates(mouseX: number, mouseY: number) {
  const [eventX, eventY] = getNormalisedCanvasCoordinates(mouseX, mouseY);

  // Use orthonormal assumption of camera
  const xScale = PROJECTION_MATRIX[0] * CANVAS_ADJUSTMENT;
  const yScale = PROJECTION_MATRIX[5] * CANVAS_ADJUSTMENT;
  const cameraDist = -CAMERA.position[2];
  const actionPoint: [number, number] = [
    (eventX / xScale) * cameraDist * SIN_FIELD_OF_VIEW - CAMERA.position[0],
    (-eventY / yScale) * cameraDist * SIN_FIELD_OF_VIEW - CAMERA.position[1],
  ];
  return actionPoint;
}

export function getScreenCoordinates(worldX: number, worldY: number): [number, number] {
  const xScale = PROJECTION_MATRIX[0] * CANVAS_ADJUSTMENT;
  const yScale = PROJECTION_MATRIX[5] * CANVAS_ADJUSTMENT;
  const cameraDist = -CAMERA.position[2];
  const screenPoint: [number, number] = [
    ((worldX + CAMERA.position[0]) / (cameraDist * SIN_FIELD_OF_VIEW)) * xScale,
    (-(worldY + CAMERA.position[1]) / (cameraDist * SIN_FIELD_OF_VIEW)) * yScale,
  ];
  return screenPoint;
}

export function clipPointToScreenRange(p: [number, number]): [number, number] {
  p[0] = Math.max(Math.min(p[0], 1), -1);
  p[1] = Math.max(Math.min(p[1], 1), -1);
  return p;
}

export function addHighlightBbox(bbox: [[number, number], [number, number]]) {
  const w1 = getScreenCoordinates(bbox[0][0], bbox[1][0]);
  const w2 = getScreenCoordinates(bbox[0][1], bbox[1][1]);

  const s1 = getPixelCoorindates(w1);
  const s2 = getPixelCoorindates(w2);

  createOrMoveRect(Math.min(s1[0], s2[0]), Math.min(s1[1], s2[1]), Math.max(s1[0], s2[0]), Math.max(s1[1], s2[1]));
}
