import * as fabric from 'fabric';

const FABRIC_CANVAS_HANDLER = new fabric.Canvas('fabric-canvas');

export let HIGHLIGHT_RECT: fabric.Rect | undefined = undefined;

export function inialiseRect(minX: number, minY: number, maxX: number, maxY: number) {
    const HIGHLIGHT_RECT = new fabric.Rect({
        left: minX,
        top: minY,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 1,
        width: maxX - minX,
        height: maxY - minY,
        angle: 0,     
        selectable: true,
    });
    FABRIC_CANVAS_HANDLER.add(HIGHLIGHT_RECT);
    FABRIC_CANVAS_HANDLER.setActiveObject(HIGHLIGHT_RECT);
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