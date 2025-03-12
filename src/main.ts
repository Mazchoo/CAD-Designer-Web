const WASAM_INIT = startUpWasm();

import { getBuffers } from './buffers';
import { startUpWasm, updateOffsetDisplay } from './patternHandle';
import {
  DEVICE,
  UNIFORM_BUFFER,
  RENDER_PASS_DESCRIPTOR,
  CONTEXT,
  UNIFORM_BIND_GROUP,
  LINE_DRAW_PIPELINE,
  getModelViewProjectionMatrix,
  addHighlightBbox,
  getDxfWorldCoorindates,
  CAMERA,
} from './rendering';
import { addCallbacks } from './events';
import { setupMenuCallbacks } from './menuEvents';
import {
  RECT_WORLD_COORDS,
  HIGHLIGHT_RECT,
  highlightRectIsBeingEdited,
  setRectOriginalWoordCoord,
} from './fabricHandle';
import { INPUT_HANDLER } from './globals';
import Stats from 'stats.js';

setupMenuCallbacks();
addCallbacks();

let LAST_FRAME_MS = performance.now();
let PROFILE = false;

if (PROFILE) {
  var stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

function frame() {
  if (PROFILE) stats.begin();
  const now = performance.now();
  const deltaTime = (now - LAST_FRAME_MS) / 1000;
  LAST_FRAME_MS = now;

  const input = INPUT_HANDLER();
  const modelViewProjection = getModelViewProjectionMatrix(deltaTime, input);

  if (RECT_WORLD_COORDS && !highlightRectIsBeingEdited() && HIGHLIGHT_RECT) {
    addHighlightBbox(RECT_WORLD_COORDS);
    setRectOriginalWoordCoord(getDxfWorldCoorindates(HIGHLIGHT_RECT.left, HIGHLIGHT_RECT.top));
  }

  // Special case to allow panning when editing offset position
  if (highlightRectIsBeingEdited() && CAMERA.isMoving() && HIGHLIGHT_RECT) {
    updateOffsetDisplay(HIGHLIGHT_RECT);
  }

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
    // ToDo - Add another set of annotation buffers
    const [verticesBuffer, indexBuffer, nrIndices] = buffers;

    passEncoder.setBindGroup(0, UNIFORM_BIND_GROUP);
    passEncoder.setPipeline(LINE_DRAW_PIPELINE);
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.setIndexBuffer(indexBuffer, 'uint32');
    passEncoder.drawIndexed(nrIndices, 1, 0, 0, 0);
    passEncoder.end();
    DEVICE.queue.submit([commandEncoder.finish()]);
  }

  if (PROFILE) stats.end();
  requestAnimationFrame(frame);
}

// Start app
await WASAM_INIT;
requestAnimationFrame(frame);
