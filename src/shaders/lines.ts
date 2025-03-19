export const program = `struct Uniforms {
    modelViewProjectionMatrix : mat4x4f,
  }
  
  @group(0) @binding(0) var<uniform> uniforms : Uniforms;
  
  struct VertexInput {
      @location(0) position : vec2<f32>,
      @location(1) color : f32,
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

      let colorBits: u32 = bitcast<u32>(input.color);

      let r: f32 = f32((colorBits >> 24u) & 0xFFu) / 255.0;
      let g: f32 = f32((colorBits >> 16u) & 0xFFu) / 255.0;
      let b: f32 = f32((colorBits >> 8u)  & 0xFFu) / 255.0;
      let a: f32 = f32( colorBits         & 0xFFu) / 255.0;
  
      output.color = vec4<f32>(r, g, b, a);
      return output;
  }
  
  @fragment
  fn fs_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
      return color; 
  }
`;
