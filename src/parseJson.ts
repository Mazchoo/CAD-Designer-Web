import { mapBuffersToDevice } from './buffers';

const crossSize = 0.3;
const vertexStride = 6;

export interface IVertex {
  x: number;
  y: number;
}

export interface IMinEntity {
  entity_type: string;
  layer: string;
  shape?: boolean;
  vertices?: IVertex[];
  position?: IVertex;
  entityIndex?: string;
  startPoint?: IVertex;
  textHeight?: number;
  text?: string,
}

export interface IMinBlock {
  entities: IMinEntity[];
  centroid: IVertex;
  layer: string;
}

export interface IInsertEntity {
  entity_type: string;
  name: string;
  position: IVertex;
  layer: string;
}

export interface IMinPatternJson {
  blocks: { [blockKey: string]: IMinBlock };
  entities: IInsertEntity[];
}

export interface IGPUArray {
  vertexArray: Float32Array;
  indexArray: Uint32Array;
}

const offsetVertex = (v: IVertex, offset: IVertex): IVertex => {
  return { x: v.x + offset.x, y: v.y + offset.y };
};

const parseJson = (pattern: IMinPatternJson | undefined): IGPUArray | undefined => {
  if (pattern === undefined) {
    console.error('No pattern json defined');
    return;
  }

  const offsets: { [blockKey: string]: IVertex } = {};
  for (const insert of pattern.entities) {
    offsets[insert.name] = insert.position;
  }

  const vertexOutput: number[] = [];
  const indexOutput: number[] = [];

  let currentOffset: IVertex = { x: 0, y: 0 };
  for (const [blockKey, block] of Object.entries(pattern.blocks)) {
    if (Object.keys(offsets).includes(blockKey)) {
      currentOffset = offsets[blockKey];
    } else {
      currentOffset = { x: 0, y: 0 };
    }

    for (const entity of block.entities) {
      if (entity.vertices) {
        const firstClosedIndex: number | undefined =
          entity.shape && entity.vertices[0] && entity.vertices[0] !== entity.vertices.at(-1)
            ? vertexOutput.length / vertexStride
            : undefined;

        for (const v of entity.vertices) {
          const outVertex = offsetVertex(v, currentOffset);
          // prettier-ignore
          const newLine = [outVertex.x, outVertex.y, 0, 0, 0, 1];

          indexOutput.push(vertexOutput.length / vertexStride);
          vertexOutput.push(...newLine);
        }

        if (firstClosedIndex) {
          indexOutput.push(firstClosedIndex);
        }

        indexOutput.push(0xffffffff);
      } else if (entity.position && entity.entity_type === "POINT") {
        const newVertexStartInd = vertexOutput.length / vertexStride;
        const outVertex = offsetVertex(entity.position, currentOffset);
        const newX = outVertex.x;
        const newY = outVertex.y;

        // prettier-ignore
        const newLines = [
            newX - crossSize, newY - crossSize, 0, 0, 0, 1,
            newX + crossSize, newY + crossSize, 0.1, 0.1, 0.1, 1,
            newX + crossSize, newY - crossSize, 0.05, 0.05, 0.05, 1,
            newX - crossSize, newY + crossSize, 0.05, 0.05, 0.05, 1,
        ];

        // prettier-ignore
        const newIndices = [
            newVertexStartInd, newVertexStartInd + 1, 0xffffffff,
            newVertexStartInd + 2, newVertexStartInd + 3, 0xffffffff
        ]

        vertexOutput.push(...newLines);
        indexOutput.push(...newIndices);
      }
    }
  }

  return {
    vertexArray: new Float32Array(vertexOutput),
    indexArray: new Uint32Array(indexOutput),
  };
};

export function uploadJSON() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  fileInput.click();
}

export function readJSON() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;

  const file = fileInput.files?.[0];
  console.log(file);

  if (file) {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      console.log('Uploading json');
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const newArrays = parseJson(jsonData.patternJson as IMinPatternJson);

        if (newArrays) {
          mapBuffersToDevice(newArrays.vertexArray, newArrays.indexArray);
        }
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    };

    reader.readAsText(file);
  } else {
    console.error('No file selected.');
  }

  readJsonToWasm();
}

export function readJsonToWasm() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;

  const file = fileInput.files?.[0];
  console.log(file);

  if (file) {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      console.log('Uploading json');
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        console.log(jsonData);

      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    };

    reader.readAsText(file);
  } else {
    console.error('No file selected.');
  }
}
