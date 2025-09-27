use core::f32;

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
    pub max_y: f32,
}

impl<'a> IDrawingOutput<'a> {
    pub fn new(vertex_buffer: &'a mut VertexBuffer, index_buffer: &'a mut IndexBuffer) -> Self {
        return IDrawingOutput {
            vertex_buffer: vertex_buffer,
            index_buffer: index_buffer,
            last_index: 0,
            nr_entities: 0,
            min_x: f32::INFINITY,
            min_y: f32::INFINITY,
            max_x: -f32::INFINITY,
            max_y: -f32::INFINITY,
        };
    }

    pub fn update_min_max(&mut self, x: &f32, y: &f32) {
        self.min_x = self.min_x.min(*x);
        self.min_y = self.min_y.min(*y);
        self.max_x = self.max_x.max(*x);
        self.max_y = self.max_y.max(*y);
    }

    pub fn get_width_height(&self) -> (f32, f32) {
        let d_x = if self.min_x.is_finite() && self.max_x.is_finite() {
            self.max_x - self.min_x
        } else {
            0.
        };
        let d_y = if self.min_y.is_finite() && self.max_y.is_finite() {
            self.max_y - self.min_y
        } else {
            0.
        };
        return (d_x, d_y);
    }
}
