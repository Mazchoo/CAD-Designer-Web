import { Handle } from '../wasm-controller/pkg/cad_pattern_editor.js';
import { LAYER_TO_NAME } from './settings.js';

export function getLayerOptionEntry(name: string): string {
  return `
  <tr>
    <td>
      <label>
        <input type="checkbox" checked="checked" />
        <span>${name}</span>
      </label>
    </td>
    <td><a class="btn-small black"></a></td>
  </tr>
  `;
}

export function updateAvailableLayers(handle: Handle) {
  const layers = handle.get_all_layers();

  const layerOptions = document.getElementById('layer-options') as HTMLInputElement;
  layerOptions.innerHTML = '';

  let htmlString = "";
  for (const layer of layers) {
    if (layer in LAYER_TO_NAME) {
      htmlString += getLayerOptionEntry(LAYER_TO_NAME[layer]);
    } else {
      htmlString += getLayerOptionEntry(String(layer));
    }
  }

  layerOptions.insertAdjacentHTML("beforeend", htmlString);
}
