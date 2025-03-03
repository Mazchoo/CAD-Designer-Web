use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use web_sys::console;

use crate::pattern;
use crate::user_settings;
use crate::utils::bounding_box;
use crate::utils::color;

#[wasm_bindgen]
pub struct Handle {
    pattern: pattern::Pattern,
    settings: user_settings::Settings,
}

#[wasm_bindgen]
impl Handle {
    // Constructor to initialize the struct
    #[wasm_bindgen(constructor)]
    pub fn new(pattern_payload: String, settings_payload: String) -> Handle {
        let pattern = pattern::Pattern::new(pattern_payload);
        let mut settings = user_settings::Settings::default();

        if let Ok(parsed_settings) = user_settings::parse_settings(&settings_payload) {
            settings = parsed_settings;
        } else {
            console::log_1(&"Settings in incorrect format".into());
        }

        return Handle {
            pattern: pattern,
            settings: settings,
        };
    }

    pub fn get_number_entities(&self) -> usize {
        return self.pattern.get_number_entities();
    }

    pub fn get_settings(&self) -> JsValue {
        return to_value(&self.settings).unwrap();
    }

    pub fn get_draw_sequence(&self) -> JsValue {
        return to_value(&self.pattern.get_draw_sequence(&self.settings)).unwrap();
    }

    pub fn get_all_layers(&self) -> Vec<i32> {
        return self.pattern.get_all_layers();
    }

    pub fn get_all_block_names(&self) -> Vec<String> {
        return self.pattern.get_all_block_names();
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
            let (block_keys, union_bbox) = self.pattern.find_blocks_with_bbox(&bbox);

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

    pub fn highlight_block(&mut self, block_key: String, status: bool) -> bool {
        return self.pattern.set_highlight(&block_key, status);
    }

    pub fn set_highlight_offset(&mut self, v: Vec<f32>) -> bool {
        if v.len() != 2 {
            return false;
        }
        self.settings.highlight_offset = (v[0], v[1]);
        return true;
    }

    pub fn offset_highlights(&mut self) {
        self.pattern
            .offset_highlighted_objects(self.settings.highlight_offset);
        self.settings.highlight_offset = (0., 0.);
    }
}
