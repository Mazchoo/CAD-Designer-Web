// Configuration related to initial GUI settings
import { ISettings } from './interfaces/settings';

let INITIAL_SETTINGS: ISettings = {
  default_color: [0, 0, 0, 255],
  highlight_color: [0, 0, 255, 255],
  disabled_layers: [],
  layer_colors: {},
  point_threshold: 4,
  cross_size: 0.3,
  view: 'Model',
  highlight_offset: [0, 0],
  highlight_scale: [1, 1],
  highlight_flip: [false, false],
  highlight_anchor: [0, 0],
  highlight_rotation_center: [0, 0],
  highlight_rotation_angle: 0, // In radians
  highlight_nr_selected_entities: 0,
  highlight_width_height: [0, 0],
};

export const LAYER_TO_NAME: { [layer: number]: string } = {
  0: 'Unknown',
  1: 'Seam',
  2: 'TurnPoint',
  3: 'CurvePoint',
  4: 'Notch',
  5: 'Reference',
  6: 'Mirror',
  7: 'Grain',
  8: 'Markup',
  9: 'Stripe',
  10: 'Plaid',
  11: 'Cut',
  12: 'Placeholder',
  13: 'DrillHole',
  14: 'Stitch',
};

export const colorMap: Map<string, string> = new Map();
colorMap.set('black', '#000000ff');
colorMap.set('purple', '#9c27b0ff');
colorMap.set('teal', '#009688ff');
colorMap.set('green', '#4caf50ff');
colorMap.set('yellow', '#ffeb3bff');
colorMap.set('orange', '#ff9800ff');
colorMap.set('brown', '#795548ff');
colorMap.set('indigo', '#3f51b5ff');
colorMap.set('deep-purple', '#673ab7ff');
colorMap.set('pink', '#e91e63ff');

export function getNextColor(colorName: string): [string, string] {
  const keyArray = Array.from(colorMap.keys());
  let ind = 0;
  if (keyArray.includes(colorName)) {
    ind = keyArray.indexOf(colorName);
  }
  const nextKeyInd = (ind + 1) % colorMap.size;
  const nextKey = keyArray[nextKeyInd];
  return [nextKey, colorMap.get(nextKey) as string];
}

export function getInitialSettingsPayload(): string {
  return JSON.stringify(INITIAL_SETTINGS);
}
