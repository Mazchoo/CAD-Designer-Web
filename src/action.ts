import { selectBlock } from './patternHandle';

export enum ACTION_TYPES {
  NONE,
  SELECT_BLOCK,
}

export let CURRENT_ACTION = ACTION_TYPES.NONE;
let POINT_CACHE: number[] = []; // Stride 2

export function setupSelectBlockAction() {
  const currentAction = document.getElementById('current-action') as HTMLInputElement;
  currentAction.value = 'Select Block';
  CURRENT_ACTION = ACTION_TYPES.SELECT_BLOCK;
  console.log('Select Block');
}

export function setupNoneAction() {
  const currentAction = document.getElementById('current-action') as HTMLInputElement;
  currentAction.value = 'None';
  CURRENT_ACTION = ACTION_TYPES.NONE;
  console.log('Action None');
}

export function performAction(point: [number, number]) {
  if (CURRENT_ACTION === ACTION_TYPES.NONE) {
    return;
  } else if (CURRENT_ACTION === ACTION_TYPES.SELECT_BLOCK) {
    selectBlock(point);
  }
}
