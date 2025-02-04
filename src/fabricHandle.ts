import * as fabric from 'fabric';

export const FABRIC_CANVAS_HANDLER = new fabric.Canvas('fabric-canvas');

let HIGHLIGHT_RECT: fabric.Rect | null = null;

export function inialiseRect(minX: number, minY: number, maxX: number, maxY: number) {
    if (HIGHLIGHT_RECT !== null) return;

    HIGHLIGHT_RECT = new fabric.Rect({
        left: minX,
        top: minY,
        fill: 'transparent',
        stroke: 'blue',
        strokeWidth: 1,
        width: maxX - minX,
        height: maxY - minY,
        angle: 0,     
        selectable: true,
    });

    FABRIC_CANVAS_HANDLER.add(HIGHLIGHT_RECT);
    FABRIC_CANVAS_HANDLER.setActiveObject(HIGHLIGHT_RECT);
}

export function updateRect(minX: number, minY: number, maxX: number, maxY: number) {
    if (HIGHLIGHT_RECT === null) return;
    HIGHLIGHT_RECT.set({ left: minX, top: minY, width: maxX - minX, height: maxY - minY});
    HIGHLIGHT_RECT.setCoords();
    FABRIC_CANVAS_HANDLER.requestRenderAll();
}

export function clearCanvas() {
    if (HIGHLIGHT_RECT === null) return;
    FABRIC_CANVAS_HANDLER.clear();
    HIGHLIGHT_RECT = null;
}

export function initialiseCanvas(height: number, width: number) {
    FABRIC_CANVAS_HANDLER.setDimensions({height: height, width: width});
    inialiseRect(150, 150, 200, 200);
    FABRIC_CANVAS_HANDLER.selection = false;
}

export function updateCanvasHeightWidth(height: number, width: number) {
    FABRIC_CANVAS_HANDLER.setDimensions({height: height, width: width});
}

export function enableSelection() {
    FABRIC_CANVAS_HANDLER.selection = true;
}

export function disableSelection() {
    FABRIC_CANVAS_HANDLER.selection = false;
}

FABRIC_CANVAS_HANDLER.on('mouse:down', (e) => {
    if (!FABRIC_CANVAS_HANDLER.selection) return;
    console.log('Start', e.scenePoint);
});

FABRIC_CANVAS_HANDLER.on('mouse:up', (e) => {
    if (!FABRIC_CANVAS_HANDLER.selection) return;
    console.log('End', e.scenePoint);
})
