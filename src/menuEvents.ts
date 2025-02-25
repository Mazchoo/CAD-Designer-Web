// Assign these functions to the global scope for JS
import { setupSelectBlockAction, setupPanAction } from './action';
import { uploadJSON, readJsonToWasm } from './parseJson';

export function setupMenuCallbacks() {
  (window as any).uploadJSON = uploadJSON;
  (window as any).readJsonToWasm = readJsonToWasm;
  (window as any).setupSelectBlockAction = setupSelectBlockAction;
  (window as any).setupPanAction = setupPanAction;
}
