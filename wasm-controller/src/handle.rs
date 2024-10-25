use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use web_sys::console;

use crate::pattern;
use crate::user_settings;

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
}
