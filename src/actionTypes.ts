export enum ACTION_TYPES {
  PAN,
  SELECT_BLOCK,
}

export let CURRENT_ACTION = ACTION_TYPES.PAN;

export function setCurrentAction(actionType: ACTION_TYPES) {
  CURRENT_ACTION = actionType;
}
