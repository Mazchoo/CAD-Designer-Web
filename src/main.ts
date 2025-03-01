const WASAM_INIT = startUpWasm();

import { getBuffers } from './buffers';
import { startUpWasm, updateHighlightPosition } from './patternHandle';
import {
  DEVICE,
  UNIFORM_BUFFER,
  RENDER_PASS_DESCRIPTOR,
  CONTEXT,
  UNIFORM_BIND_GROUP,
  LINE_DRAW_PIPELINE,
  getModelViewProjectionMatrix,
  addHighlightBbox,
  CAMERA,
} from './rendering';
import { addCallbacks } from './events';
import { setupMenuCallbacks } from './menuEvents';
import { RECT_WORLD_COORDS, MARKER_WORLD_COORDS, HIGHLIGHT_RECT, highlightRectIsMoving } from './fabricHandle';
import { INPUT_HANDLER } from './globals';

setupMenuCallbacks();
addCallbacks();

let LAST_FRAME_MS = Date.now();

function frame() {
  const now = Date.now();
  const deltaTime = (now - LAST_FRAME_MS) / 1000;
  LAST_FRAME_MS = now;

  const input = INPUT_HANDLER();
  const modelViewProjection = getModelViewProjectionMatrix(deltaTime, input);

  if (RECT_WORLD_COORDS && !highlightRectIsMoving()) {
    addHighlightBbox(RECT_WORLD_COORDS);
  }

  if (highlightRectIsMoving() && CAMERA.isMoving() && HIGHLIGHT_RECT) {
    console.log('Mouse move triggered');
    updateHighlightPosition(HIGHLIGHT_RECT);
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

  requestAnimationFrame(frame);
}

// Start app
await WASAM_INIT;
requestAnimationFrame(frame);
