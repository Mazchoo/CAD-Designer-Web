// Struct to hold output information of a drawing pass
use crate::utils::memory::{IndexBuffer, VertexBuffer};

pub struct IDrawingOutput<'a> {
    pub vertex_buffer: &'a mut VertexBuffer,
    pub index_buffer: &'a mut IndexBuffer,
    pub last_index: u32,
    pub nr_entities: u32,
    pub min_x: f32,
    pub min_y: f32,
    pub max_x: f32,
    pub max_y: f32
}

impl<'a> IDrawingOutput<'a> {
    pub fn new(vertex_buffer: &'a mut VertexBuffer, index_buffer: &'a mut IndexBuffer) -> Self {
        return IDrawingOutput {
            vertex_buffer: vertex_buffer,
            index_buffer: index_buffer,
            last_index: 0,
            nr_entities: 0,
            min_x: 0.,
            min_y: 0.,
            max_x: 0.,
            max_y: 0.
        };
    }

    pub fn update_min_max(&mut self, x: &f32, y: &f32) {
        self.min_x = self.min_x.min(*x);
        self.min_y = self.min_y.min(*y);
        self.max_x = self.max_x.max(*x);
        self.max_y = self.max_y.max(*y);
    }

    pub fn get_width_height(&self) -> (f32, f32) {
        return (&self.max_x - &self.min_x, &self.max_y - &self.min_y);
    }
}