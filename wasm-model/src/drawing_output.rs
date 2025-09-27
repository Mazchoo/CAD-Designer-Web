// Struct to hold output information of a drawing pass
use crate::utils::memory::{IndexBuffer, VertexBuffer};

pub struct IDrawingOutput<'a> {
    pub vertex_buffer: &'a mut VertexBuffer,
    pub index_buffer: &'a mut IndexBuffer,
    pub last_index: u32,
    pub nr_entities: u32,
}

impl<'a> IDrawingOutput<'a> {
    pub fn new(vertex_buffer: &'a mut VertexBuffer, index_buffer: &'a mut IndexBuffer) -> Self {
        return IDrawingOutput {
            vertex_buffer: vertex_buffer,
            index_buffer: index_buffer,
            last_index: 0,
            nr_entities: 0,
        };
    }
}