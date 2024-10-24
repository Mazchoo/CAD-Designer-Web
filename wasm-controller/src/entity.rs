use std::i32;

use ndarray::Array2;

use crate::utils::bounding_box;

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
    pub entity_type: EntityTypes,
    pub layer: i32,
    pub shape: bool,
    pub vertices: Array2<f32>,
    pub text_height: f32,
    pub entity_index: [u8; 32],
    pub text: String,
    // Cached variables
    pub bounding_box: ((f32, f32), (f32, f32)),
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
        let bounding_box = bounding_box::calculate_bounding_box(&vertices);
        return Entity {
            entity_type: entity_type,
            layer: layer,
            shape: shape,
            vertices: vertices,
            text_height: text_height,
            entity_index: entity_index,
            text: text,
            bounding_box: bounding_box,
        };
    }

    pub fn get_closest_point_on_entity(&self) {}

    pub fn has_point_within_threshold(&self, threshold: f32) {}

    pub fn get_closest_defined_point_on_entity(&self) {}

    pub fn has_defined_point_within_threshold(&self, threshold: f32) {}

    pub fn get_draw_sequence(&self, color: &(f32, f32, f32, f32), offset: &Array2<f32>, cross_size: &f32,
                             last_index: &mut i32, vertex_buffer: &mut Vec<f32>, index_buffer: &mut Vec<i32>) {
        if self.vertices.len() == 0 { return; }

        let offset_vertices = self.vertices.clone() + offset;
        if self.vertices.len() == 1 {
            let (x, y) = (offset_vertices[(0, 0)], offset_vertices[(0, 1)]);
            vertex_buffer.extend([
                x - cross_size, y - cross_size, color.0 - 0.05, color.1 - 0.05, color.2 - 0.05, color.3,
                x + cross_size, y + cross_size, color.0 + 0.05, color.1 + 0.05, color.2 + 0.05, color.3,
                x + cross_size, y - cross_size, color.0, color.1, color.2, color.3,
                x - cross_size, y + cross_size, color.0, color.1, color.2, color.3,
            ]);

            index_buffer.extend([
                *last_index, *last_index + 1, i32::MAX,
                *last_index + 2, *last_index + 3, i32::MAX
            ]);

            *last_index += 4;
        } else {
            for v in offset_vertices.rows().into_iter() {
                vertex_buffer.extend([v[0], v[1], color.0 , color.1, color.2, color.3]);
                index_buffer.push(*last_index);
                *last_index += 1;
            }
            index_buffer.push(i32::MAX);
        }
    }
}
