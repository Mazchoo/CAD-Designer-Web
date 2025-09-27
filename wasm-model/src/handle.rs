use ndarray::Array2;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use web_sys::console;

use crate::pattern;
use crate::user_settings;
use crate::utils::bounding_box;
use crate::utils::color;
use crate::utils::memory::{IndexBuffer, VertexBuffer};

#[wasm_bindgen]
pub struct Handle {
    pattern: pattern::Pattern,
    settings: user_settings::ISettings,
    vertex_buffer: VertexBuffer,
    index_buffer: IndexBuffer,
}

#[wasm_bindgen]
impl Handle {
    // Constructor to initialize the struct
    #[wasm_bindgen(constructor)]
    pub fn new(pattern_payload: String, settings_payload: String) -> Handle {
        let pattern = pattern::Pattern::new(pattern_payload);
        let mut settings = user_settings::ISettings::default();

        if let Ok(parsed_settings) = user_settings::ISettings::parse_settings(&settings_payload) {
            settings = parsed_settings;
        } else {
            console::log_1(&"Settings in incorrect format".into());
        }

        let vertex_buffer: VertexBuffer = VertexBuffer::new();
        let index_buffer: IndexBuffer = IndexBuffer::new();

        return Handle {
            pattern: pattern,
            settings: settings,
            vertex_buffer: vertex_buffer,
            index_buffer: index_buffer,
        };
    }

    pub fn get_number_entities(&self) -> usize {
        return self.pattern.get_number_entities();
    }

    pub fn get_settings(&self) -> JsValue {
        return to_value(&self.settings).unwrap();
    }

    pub fn update_draw_sequence(&mut self) {
        let _ = &self.vertex_buffer.buffer.clear();
        let _ = &self.index_buffer.buffer.clear();
        self.pattern.update_draw_sequence(
            &mut self.settings,
            &mut self.vertex_buffer,
            &mut self.index_buffer,
        );
    }

    pub fn get_all_layers(&self) -> Vec<i32> {
        return self.pattern.get_all_layers();
    }

    pub fn get_all_block_names(&self) -> Vec<String> {
        return self.pattern.get_all_block_names();
    }

    pub fn get_vertex_buffer_ptr(&self) -> *const f32 {
        return self.vertex_buffer.get_ptr();
    }

    pub fn get_vertex_buffer_len(&self) -> usize {
        return self.vertex_buffer.get_len();
    }

    pub fn get_index_buffer_ptr(&self) -> *const u32 {
        return self.index_buffer.get_ptr();
    }

    pub fn get_index_buffer_len(&self) -> usize {
        return self.index_buffer.get_len();
    }

    pub fn set_view(&mut self, name: String) {
        self.settings.view = name;
    }

    pub fn set_layer_color(&mut self, layer: i32, color_hex: String) {
        if let Ok(col_array) = color::hex_to_rgba(&color_hex) {
            self.settings.layer_colors.insert(layer, col_array);
        }
    }

    pub fn reset_selection(&mut self) {
        self.pattern.reset_selection();
    }

    pub fn select_block_with_point(&mut self, point: Vec<f32>) -> JsValue {
        let empty_output: Vec<String> = vec![];
        if point.len() != 2 {
            self.pattern.highlight_selection(&empty_output);
            return to_value(&empty_output).unwrap();
        }
        let point_tuple = (point[0], point[1]);
        let block_keys = self
            .pattern
            .find_blocks_with_point(&point_tuple, &self.settings);
        self.pattern.highlight_selection(&block_keys);
        return to_value(&block_keys).unwrap();
    }

    pub fn select_block_with_two_points(&mut self, v1: Vec<f32>, v2: Vec<f32>) -> JsValue {
        let empty_output: Vec<String> = vec![];
        if let Some(bbox) = bounding_box::construct_from_vectors(v1, v2) {
            let (block_keys, union_bbox) = self
                .pattern
                .find_blocks_with_bbox(&bbox, &self.settings.view);

            self.pattern.highlight_selection(&block_keys);
            return to_value(&(block_keys, union_bbox)).unwrap();
        }
        self.pattern.highlight_selection(&empty_output);
        return to_value(&(empty_output, ())).unwrap();
    }

    pub fn disable_layer(&mut self, layer: i32) {
        if !self.settings.disabled_layers.contains(&layer) {
            self.settings.disabled_layers.push(layer);
        }
    }

    pub fn enable_layer(&mut self, layer: i32) {
        self.settings.disabled_layers.retain(|&x| x != layer);
    }

    pub fn highlight_block(&mut self, block_key: String, status: bool) {
        self.pattern.set_highlight(&block_key, status);
    }

    pub fn set_highlight_offset(&mut self, offset_x: f32, offset_y: f32) {
        self.settings.highlight_offset = (offset_x, offset_y);
    }

    pub fn offset_highlights(&mut self) {
        self.pattern
            .offset_highlighted_objects(self.settings.highlight_offset, &self.settings.view);
        self.settings.highlight_offset = (0., 0.);
    }

    pub fn set_highlight_scale(&mut self, scale_x: f32, scale_y: f32) {
        self.settings.highlight_scale = (scale_x, scale_y);
    }

    pub fn set_highlight_flip(&mut self, flip_x: bool, flip_y: bool) {
        self.settings.highlight_flip = (flip_x, flip_y);
    }

    pub fn set_highlight_rotation_center(&mut self, rot_center_x: f32, rot_center_y: f32) {
        self.settings.highlight_rotation_center = (rot_center_x, rot_center_y);
    }

    pub fn set_highlight_rotation_angle(&mut self, angle_rad: f32) {
        self.settings.highlight_rotation_angle = angle_rad;
    }

    pub fn set_highlight_anchor(&mut self, anchor_x: f32, anchor_y: f32) {
        self.settings.highlight_anchor = (anchor_x, anchor_y);
    }

    pub fn scale_highlights(&mut self) {
        self.pattern.scale_highlighted_objects(
            &self.settings.highlight_scale_array(),
            &self.settings.highlight_anchor_array(),
            &self.settings.view,
        );

        self.settings.highlight_scale = (1., 1.);
        self.settings.highlight_flip = (false, false);
        self.settings.highlight_anchor = (0., 0.);
    }

    pub fn rotate_highlights(&mut self) -> JsValue {
        let rot_matrix: &Array2<f32> = &self.settings.highlight_rot_matrix();
        let center: &Array2<f32> = &self.settings.highlight_rot_center_array();
        let rotate_offset: &Array2<f32> = &(center - center.dot(rot_matrix));

        self.pattern
            .rotate_highlights(rot_matrix, rotate_offset, &self.settings.view);

        let rotated_bbox = self
            .pattern
            .get_highlighted_bounding_box(&self.settings.view);

        self.settings.highlight_rotation_angle = 0.;

        if rotated_bbox == Option::None {
            return to_value(&()).unwrap();
        } else {
            return to_value(&rotated_bbox).unwrap();
        }
    }
}
