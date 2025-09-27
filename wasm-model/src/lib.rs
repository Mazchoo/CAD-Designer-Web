use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;
use web_sys::console;

pub mod block;
pub mod drawing_output;
pub mod drawing_parameters;
pub mod entity;
pub mod handle;
pub mod insert;
pub mod parse_pattern;
pub mod pattern;
pub mod user_settings;
pub mod utils;

#[wasm_bindgen]
pub fn read_pattern(json_payload: &str) -> bool {
    if let Ok(_pattern) = parse_pattern::parse_pattern(json_payload) {
        console::log_1(&"Parsed the pattern".into());
        return true;
    } else {
        console::log_1(&"Parsing failed".into());
        return false;
    }
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    console::log_1(&format!("Hello to the console {}", name).into());
}

#[wasm_bindgen]
pub fn get_buffer_udpate() -> JsValue {
    return to_value(&vec![1., 1., 1., 10.]).unwrap();
}
