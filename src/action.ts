import { selectBlockWithBBox } from './patternHandle';
import { enableSelection, disableSelection } from './fabricHandle';

export enum ACTION_TYPES {
  PAN,
  SELECT_BLOCK,
}

export let CURRENT_ACTION = ACTION_TYPES.PAN;
let POINT_DOWN: [number, number] | null = null;

export function setupSelectBlockAction() {
  const currentAction = document.getElementById('current-action') as HTMLInputElement;
  currentAction.value = 'Select Block';
  CURRENT_ACTION = ACTION_TYPES.SELECT_BLOCK;
  enableSelection();
  console.log('Select Block');
}

export function setupPanAction() {
  const currentAction = document.getElementById('current-action') as HTMLInputElement;
  currentAction.value = 'Pan';
  CURRENT_ACTION = ACTION_TYPES.PAN;
  disableSelection();
  console.log('Action Pan');
}

export function performAction(point: [number, number], mouseDown: boolean) {
  if (CURRENT_ACTION === ACTION_TYPES.PAN) {
    return;
  } else if (CURRENT_ACTION === ACTION_TYPES.SELECT_BLOCK) {
    if (mouseDown) {
      POINT_DOWN = point;
    } else if (POINT_DOWN != null) {
      selectBlockWithBBox(POINT_DOWN, point);
    }
  }
}
