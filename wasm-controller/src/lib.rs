use web_sys::console;
use wasm_bindgen::prelude::*;

pub mod block;
pub mod entity;
pub mod insert;
pub mod parse_pattern;
pub mod pattern;

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
pub fn get_buffer_udpate() -> Vec<f32> {
    return vec![1., 1., 1., 10.];
}
