export const program = `struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms : Uniforms;

struct VertexInput {
    @location(0) position : vec2<f32>,
    @location(1) color : vec4<f32>,
};

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) color : vec4<f32>,
};

@vertex
fn vertex_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    // Convert vec2 to vec4 by adding z = 0.0 and w = 1.0
    let position4D = vec4<f32>(input.position, 0.0, 1.0);
    output.position = uniforms.modelViewProjectionMatrix * position4D;
    output.color = input.color;
    return output;
}

@fragment
fn fs_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
    return color;
}
`;
