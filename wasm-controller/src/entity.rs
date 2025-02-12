use std::i32;

use ndarray::Array2;

use crate::user_settings;
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
    pub selected: bool,
    pub hightlighted: bool,
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
            selected: false,
            hightlighted: false,
        };
    }

    pub fn get_draw_sequence(
        &self,
        color: &(f32, f32, f32, f32),
        offset: &Array2<f32>,
        cross_size: &f32,
        last_index: &mut u32,
        vertex_buffer: &mut Vec<f32>,
        index_buffer: &mut Vec<u32>,
    ) {
        if self.vertices.len() == 0 {
            return;
        }

        let offset_vertices = self.vertices.clone() + offset;
        let num_rows = self.vertices.shape()[0];
        if num_rows == 1 {
            let x = offset_vertices[(0, 0)];
            let y = offset_vertices[(0, 1)];
            // draw a cross using vertex data format x, y, r, g, b, a
            vertex_buffer.extend([
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

            index_buffer.extend([
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
                vertex_buffer.extend([v[0], v[1], color.0, color.1, color.2, color.3]);
                index_buffer.push(*last_index);
                *last_index += 1;
            }

            // Close loop for display if closed
            if self.shape {
                index_buffer.push(*last_index + 1 - (num_rows as u32));
            }

            // u32::MAX denotes end of line
            index_buffer.push(u32::MAX);
        }
    }

    pub fn reset_selection(&mut self) {
        self.selected = false;
        self.hightlighted = false;
    }

    pub fn get_color<'a>(
        &self,
        settings: &'a user_settings::Settings,
        default_color: &'a (f32, f32, f32, f32),
    ) -> &'a (f32, f32, f32, f32) {
        let mut entity_color = default_color;

        if self.selected {
            entity_color = &settings.select_color;
        } else if self.hightlighted {
            entity_color = &settings.highlight_color;
        } else if settings.layer_colors.contains_key(&self.layer) {
            entity_color = &settings.layer_colors[&self.layer]
        };
        return entity_color;
    }

    pub fn get_closest_point_on_entity(&self) {}

    pub fn has_point_within_threshold(&self, threshold: f32) {}

    pub fn get_closest_defined_point_on_entity(&self) {}

    pub fn has_defined_point_within_threshold(&self, threshold: f32) {}
}
