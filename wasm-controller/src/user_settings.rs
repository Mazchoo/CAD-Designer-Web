use std::collections::HashMap;
use wasm_bindgen::prelude::*;

use serde::{Deserialize, Serialize};
use serde_json::Result;

#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub default_color: (f32, f32, f32, f32),
    pub highlight_color: (f32, f32, f32, f32),
    pub select_color: (f32, f32, f32, f32),
    pub layer_colors: HashMap<i32, (f32, f32, f32, f32)>,
    pub point_threshold: f32,
    pub cross_size: f32,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            default_color: (0., 0., 0., 1.),
            highlight_color: (0., 0., 1., 1.),
            select_color: (1., 0., 0., 1.),
            layer_colors: HashMap::new(),
            point_threshold: 1.,
            cross_size: 0.3,
        }
    }
}

pub fn parse_settings(json_str: &str) -> Result<Settings> {
    let parsed_settings: Settings = serde_json::from_str(json_str)?;
    Ok(parsed_settings)
}
