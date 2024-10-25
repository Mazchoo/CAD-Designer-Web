import { mapBuffersToDevice } from './buffers';
import { intilizePattern } from './patternHandle';

export interface IGPUArray {
  vertexArray: Float32Array;
  indexArray: Uint32Array;
}

export function uploadJSON() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  fileInput.click();
}

export function readJsonToWasm() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;

  const file = fileInput.files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      console.log('Uploading json');
      const drawArrays = intilizePattern(e.target?.result as string);
      if (drawArrays) {
        mapBuffersToDevice(new Float32Array(drawArrays[0]), new Uint32Array(drawArrays[1]));
      }
    };

    reader.readAsText(file);
  } else {
    console.error('No file selected.');
  }
}
