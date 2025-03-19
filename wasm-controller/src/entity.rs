use std::i32;

use ndarray::Array2;

use crate::user_settings;
use crate::utils::bounding_box;
use crate::utils::memory::{IndexBuffer, VertexBuffer};

#[derive(Debug)]
pub enum EntityTypes {
    POINT,
    POLYLINE,
    LINE,
    LWPOLYLINE,
    LWLINE,
    TEXT,
    INSERT,
}

#[derive(Debug)]
pub struct Entity {
    // Design Settings
    pub entity_type: EntityTypes,
    pub layer: i32,
    pub shape: bool,
    pub vertices: Array2<f32>,
    pub text_height: f32,
    pub entity_index: [u8; 32],
    pub text: String,

    // Cached variables
    pub bounding_box: ((f32, f32), (f32, f32)),

    // Display settings
    pub highlighted: bool,
}

impl Entity {
    pub fn new(
        entity_type: EntityTypes,
        layer: i32,
        shape: bool,
        vertices: Array2<f32>,
        text_height: f32,
        entity_index: [u8; 32],
        text: String,
    ) -> Entity {
        let bounding_box = bounding_box::from_array(&vertices);
        return Entity {
            entity_type: entity_type,
            layer: layer,
            shape: shape,
            vertices: vertices,
            text_height: text_height,
            entity_index: entity_index,
            text: text,
            bounding_box: bounding_box,
            highlighted: false,
        };
    }

    pub fn update_draw_sequence(
        &self,
        color: &(f32, f32, f32, f32),
        offset: &Array2<f32>,
        scale: &Array2<f32>,
        anchor: &Array2<f32>,
        rot_offset: &Array2<f32>,
        rot_matrix: &Array2<f32>,
        cross_size: &f32,
        last_index: &mut u32,
        vertex_buffer: &mut VertexBuffer,
        index_buffer: &mut IndexBuffer,
    ) {
        if self.vertices.len() == 0 {
            return;
        }

        let mut offset_vertices: Array2<f32> = &self.vertices + offset;

        if self.highlighted {
            if scale[(0, 0)] != 1. || scale[(0, 1)] != 1. {
                self.calculate_scaled_vertices(&mut offset_vertices, scale, anchor);
            } else if rot_matrix[(0, 0)] != 1. {
                self.calculate_rotated_vertices(&mut offset_vertices, rot_matrix, rot_offset);
            }
        }

        let num_rows: usize = self.vertices.shape()[0];
        if num_rows == 1 {
            let x = offset_vertices[(0, 0)];
            let y = offset_vertices[(0, 1)];
            // draw a cross using vertex data format x, y, r, g, b, a
            vertex_buffer.buffer.extend([
                x - cross_size,
                y - cross_size,
                color.0 - 0.05,
                color.1 - 0.05,
                color.2 - 0.05,
                color.3,
                x + cross_size,
                y + cross_size,
                color.0 + 0.05,
                color.1 + 0.05,
                color.2 + 0.05,
                color.3,
                x + cross_size,
                y - cross_size,
                color.0,
                color.1,
                color.2,
                color.3,
                x - cross_size,
                y + cross_size,
                color.0,
                color.1,
                color.2,
                color.3,
            ]);

            index_buffer.buffer.extend([
                *last_index,
                *last_index + 1,
                u32::MAX,
                *last_index + 2,
                *last_index + 3,
                u32::MAX,
            ]);

            *last_index += 4;
        } else {
            for v in offset_vertices.rows().into_iter() {
                vertex_buffer
                    .buffer
                    .extend([v[0], v[1], color.0, color.1, color.2, color.3]);
                index_buffer.buffer.push(*last_index);
                *last_index += 1;
            }

            // Close loop for display if closed
            if self.shape {
                index_buffer
                    .buffer
                    .push(*last_index + 1 - (num_rows as u32));
            }

            // u32::MAX denotes end of line
            index_buffer.buffer.push(u32::MAX);
        }
    }

    pub fn remove_highlight(&mut self) {
        self.highlighted = false;
    }

    pub fn get_color<'a>(
        &self,
        settings: &'a user_settings::Settings,
        default_color: &'a (f32, f32, f32, f32),
    ) -> &'a (f32, f32, f32, f32) {
        let mut entity_color = default_color;

        if self.highlighted {
            entity_color = &settings.highlight_color;
        } else if settings.layer_colors.contains_key(&self.layer) {
            entity_color = &settings.layer_colors[&self.layer]
        };
        return entity_color;
    }

    pub fn offset_vertices(&mut self, offset: &Array2<f32>) {
        self.vertices += offset;
        self.bounding_box = bounding_box::offset_bbox(&self.bounding_box, offset);
    }

    fn calculate_scaled_vertices(
        &self,
        vertices: &mut Array2<f32>,
        scale: &Array2<f32>,
        anchor: &Array2<f32>,
    ) {
        *vertices -= anchor;
        *vertices *= scale;
        *vertices += anchor;
    }

    pub fn scale_vertices(&mut self, scale: &Array2<f32>, anchor: &Array2<f32>) {
        self.vertices -= anchor;
        self.vertices *= scale;
        self.vertices += anchor;
        self.bounding_box = bounding_box::scale_bbox(&self.bounding_box, scale, anchor);
    }

    fn calculate_rotated_vertices(
        &self,
        vertices: &mut Array2<f32>,
        rot_matrix: &Array2<f32>,
        rot_center: &Array2<f32>,
    ) {
        // *vertices = vertices.dot(rot_matrix);
        *vertices = rot_center + vertices.dot(rot_matrix);
    }

    pub fn rotate_vertices(&mut self, rot_matrix: &Array2<f32>, rot_center: &Array2<f32>) {
        self.vertices = rot_center + self.vertices.dot(rot_matrix);
        self.bounding_box = bounding_box::from_array(&self.vertices);
    }

    pub fn get_closest_point_on_entity(&self) {}

    pub fn has_point_within_threshold(&self, threshold: f32) {}

    pub fn get_closest_defined_point_on_entity(&self) {}

    pub fn has_defined_point_within_threshold(&self, threshold: f32) {}
}
