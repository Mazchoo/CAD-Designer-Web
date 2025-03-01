import { selectBlockWithBBox } from './patternHandle';
import { ACTION_TYPES, CURRENT_ACTION, setCurrentAction } from './actionTypes';

let POINT_DOWN: [number, number] | null = null;

export function setupSelectBlockAction() {
  const currentAction = document.getElementById('current-action') as HTMLInputElement;
  currentAction.value = 'Select Block';
  setCurrentAction(ACTION_TYPES.SELECT_BLOCK);
  console.log('Select Block');
}

export function setupPanAction() {
  const currentAction = document.getElementById('current-action') as HTMLInputElement;
  currentAction.value = 'Pan';
  setCurrentAction(ACTION_TYPES.PAN);
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
