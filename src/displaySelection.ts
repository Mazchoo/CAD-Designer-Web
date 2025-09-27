// Handle updates to selection bottom bar that displays information about current selection
// Bottom bar as has callbacks to update settings
import { ISettings } from './interfaces/settings';

const NR_OBJECTS_SELECTED = document.getElementById('nr-objects-selected') as HTMLInputElement;

export function updateBottomBarDisplay(settings: ISettings) {
  console.log(settings);
  NR_OBJECTS_SELECTED.value = String(settings.highlight_nr_selected_entities);
}
