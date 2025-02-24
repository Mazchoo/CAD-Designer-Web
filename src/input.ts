import { CURRENT_ACTION, ACTION_TYPES } from './action';

// Input holds as snapshot of input state
export default interface Input {
  // Digital input (e.g keyboard state)
  readonly digital: {
    readonly forward: boolean;
    readonly backward: boolean;
    readonly left: boolean;
    readonly right: boolean;
    readonly up: boolean;
    readonly down: boolean;
  };
  // Analog input (e.g mouse, touchscreen)
  readonly analog: {
    readonly x: number;
    readonly y: number;
    readonly mouseX: number;
    readonly mouseY: number;
    readonly zoom: number;
    readonly touching: boolean;
  };
}

export function getCanvasCoordinates(mouseX: number, mouseY: number, canvas: HTMLElement): [number, number] {
  const rect = canvas.getBoundingClientRect();
  // ToDo - try caching this and updating on resize
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;
  const eventX = ((mouseX - centerX) / (rect.right - rect.left)) * 2;
  const eventY = ((mouseY - centerY) / (rect.bottom - rect.top)) * 2;
  return [eventX, eventY];
}

// createInputHandler returns an InputHandler by attaching event handlers to the window and canvas.
export function createInputHandler(window: Window, canvas: HTMLElement): InputHandler {
  const digital = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };
  const analog = {
    x: 0,
    y: 0,
    zoom: 0,
    mouseX: 0,
    mouseY: 0,
  };
  let mouseDown = false;

  const setDigital = (e: KeyboardEvent, value: boolean) => {
    switch (e.code) {
      case 'ArrowUp':
        digital.up = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowDown':
        digital.down = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowLeft':
        digital.left = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowRight':
        digital.right = value;
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  window.addEventListener('keydown', (e) => setDigital(e, true));
  window.addEventListener('keyup', (e) => setDigital(e, false));

  canvas.style.touchAction = 'pinch-zoom';
  canvas.addEventListener('pointerdown', () => {
    mouseDown = true;
  });
  canvas.addEventListener('pointerup', () => {
    mouseDown = false;
  });
  canvas.addEventListener('pointermove', (e) => {
    // Calculate relative position of mouse on canvas
    if (CURRENT_ACTION !== ACTION_TYPES.PAN) return;

    const [eventX, eventY] = getCanvasCoordinates(e.clientX, e.clientY, canvas);
    analog.mouseX = eventX;
    analog.mouseY = eventY;

    mouseDown = e.pointerType == 'mouse' ? (e.buttons & 1) !== 0 : true;
    if (mouseDown) {
      analog.x += e.movementX;
      analog.y += e.movementY;
    }
  });
  canvas.addEventListener(
    'wheel',
    (e) => {
      // mouseDown = (e.buttons & 1) !== 0;
      // The scroll value varies substantially between user agents / browsers.
      // Just use the sign.
      analog.zoom += Math.sign(e.deltaY);
      e.preventDefault();
      e.stopPropagation();
    },
    { passive: false }
  );

  return () => {
    const out = {
      digital,
      analog: {
        x: analog.x,
        y: analog.y,
        mouseX: analog.mouseX,
        mouseY: analog.mouseY,
        zoom: analog.zoom,
        touching: mouseDown,
      },
    };
    // Clear the analog values, as these accumulate.
    analog.x = 0;
    analog.y = 0;
    analog.zoom = 0;
    return out;
  };
}

// InputHandler is a function that when called, returns the current Input state.
export type InputHandler = () => Input;
