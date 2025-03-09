use ndarray::{array, Array2};
use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Result;

#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub default_color: (f32, f32, f32, f32),
    pub highlight_color: (f32, f32, f32, f32),
    pub layer_colors: HashMap<i32, (f32, f32, f32, f32)>,
    pub disabled_layers: Vec<i32>,
    pub point_threshold: f32,
    pub cross_size: f32,
    pub view: String,
    // fabric rectangle
    pub highlight_offset: (f32, f32),
    pub highlight_scale: (f32, f32),
    pub highlight_flip: (bool, bool),
    pub highlight_anchor: (f32, f32),
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            default_color: (0., 0., 0., 1.),
            highlight_color: (0., 0., 1., 1.),
            layer_colors: HashMap::new(),
            disabled_layers: vec![],
            point_threshold: 4.,
            cross_size: 0.3,
            view: "Model".to_string(),
            highlight_offset: (0., 0.),
            highlight_scale: (1., 1.),
            highlight_flip: (false, false),
            highlight_anchor: (0., 0.),
        }
    }
}

impl Settings {
    pub fn parse_settings(json_str: &str) -> Result<Settings> {
        let parsed_settings: Settings = serde_json::from_str(json_str)?;
        Ok(parsed_settings)
    }

    pub fn highlight_offset_array(&self) -> ndarray::Array2<f32> {
        let (x, y) = self.highlight_offset;
        return array![[x, y]];
    }

    pub fn highlight_scale_array(&self) -> ndarray::Array2<f32> {
        let (x, y) = self.highlight_scale;
        let (flip_x, flip_y) = self.highlight_flip;
        return array![[if flip_x { -x } else { x }, if flip_y { -y } else { y }]];
    }

    pub fn highlight_anchor_array(&self) -> ndarray::Array2<f32> {
        let (x, y) = self.highlight_anchor;
        return array![[x, y]];
    }
}
