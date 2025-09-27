// Handle updates to selection bottom bar that displays information about current selection
// Bottom bar as has callbacks to update settings
import { ISettings } from './interfaces/settings';

const NR_OBJECTS_SELECTED = document.getElementById('nr-objects-selected') as HTMLInputElement;
const OFFSET_SELECTED = document.getElementById('offset-selected') as HTMLInputElement;
const WIDTH_HEIGHT_SELECTED = document.getElementById('width-height-selected') as HTMLInputElement;
const ROTATION_SELECTED = document.getElementById('rotation-selected') as HTMLInputElement;
const ROTATION_ANCHOR_SELECTED = document.getElementById('centroid-selected') as HTMLInputElement;

function formatted2dPoint(point: [number, number]): string {
  return `${point[0].toFixed(2)}, ${point[1].toFixed(2)}`;
}

function radToDegFormatted(rad: number): string {
  return String(((rad * 180) / Math.PI).toFixed(2));
}

export function updateBottomBarDisplay(settings: ISettings) {
  console.log(settings);
  NR_OBJECTS_SELECTED.value = String(settings.highlight_nr_selected_entities);
  OFFSET_SELECTED.value = formatted2dPoint(settings.highlight_offset);
  WIDTH_HEIGHT_SELECTED.value = formatted2dPoint(settings.highlight_width_height);
  ROTATION_SELECTED.value = radToDegFormatted(settings.highlight_rotation_angle);
  ROTATION_ANCHOR_SELECTED.value = formatted2dPoint(settings.highlight_rotation_center);
}
