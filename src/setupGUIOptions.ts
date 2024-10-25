import { Handle } from '../wasm-controller/pkg/cad_pattern_editor.js';
import { LAYER_TO_NAME } from './settings.js';

export function getLayerOptionEntry(name: string, layerKey: number): string {
  return `
  <tr>
    <td>
      <label>
        <input id="Layer=>${layerKey}" type="checkbox" checked="checked" />
        <span>${name}</span>
      </label>
    </td>
    <td><a id="LayerColor=>${layerKey}" class="btn-small black"></a></td>
  </tr>
  `;
}

export function updateAvailableLayers(handle: Handle) {
  const layers = handle.get_all_layers();

  const layerOptions = document.getElementById('layer-options') as HTMLInputElement;
  layerOptions.innerHTML = '';

  let htmlString = '';
  for (const layer of layers) {
    if (layer in LAYER_TO_NAME) {
      htmlString += getLayerOptionEntry(LAYER_TO_NAME[layer], layer);
    } else {
      htmlString += getLayerOptionEntry(String(layer), layer);
    }
  }

  layerOptions.insertAdjacentHTML('beforeend', htmlString);
}

export function getBlockViewEntry(name: string, checked: boolean): string {
  return `
  <tr>
    <td>
      <label>
        <input id="${checked ? 'View=>' : 'Block=>'}${name}" name="block" type="radio" ${checked ? 'checked' : ''} />
        <span>${name}</span>
      </label>
    </td>
    <td></td>
    <td></td>
  </tr>
  `;
}

export function updateAvailableBlocks(handle: Handle) {
  const blockNames = handle.get_all_block_names();

  const blockViewOptions = document.getElementById('block-view-options') as HTMLInputElement;
  blockViewOptions.innerHTML = '';

  let htmlString = '';
  htmlString += getBlockViewEntry('Model', true);
  for (const name of blockNames) {
    htmlString += getBlockViewEntry(name, false);
  }

  blockViewOptions.insertAdjacentHTML('beforeend', htmlString);
}
