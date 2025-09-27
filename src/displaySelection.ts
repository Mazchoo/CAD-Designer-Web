// Handle updates to selection bottom bar that displays information about current selection
// Bottom bar as has callbacks to update settings
import { ISettings } from './interfaces/settings';

const NR_OBJECTS_SELECTED = document.getElementById('nr-objects-selected') as HTMLInputElement;
const OFFSET_SELECTED = document.getElementById('offset-selected') as HTMLInputElement;

function formatted2dPoint(point: [number, number]): string {
  return `${point[0].toFixed(2)}, ${point[1].toFixed(2)}`;
}

export function updateBottomBarDisplay(settings: ISettings) {
  console.log(settings);
  NR_OBJECTS_SELECTED.value = String(settings.highlight_nr_selected_entities);
  OFFSET_SELECTED.value = formatted2dPoint(settings.highlight_offset);
}
