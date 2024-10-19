use wasm_bindgen::prelude::*;
use ndarray::array;

use crate::block;
use crate::entity;
use crate::insert;
use crate::parse_pattern;

#[wasm_bindgen]
#[derive(Debug)]
pub struct Pattern {
    blocks: Vec<block::Block>,
    entities: Vec<insert::Insert>,
}

#[wasm_bindgen]
impl Pattern {
    // Constructor to initialize the struct
    #[wasm_bindgen(constructor)]
    pub fn new(json_payload: String) -> Pattern {
        let mut pattern = Pattern { blocks: vec![], entities: vec![] };

        if let Ok(document) = parse_pattern::parse_pattern(&json_payload) {
            let parsed_pattern = document.pattern_json;

            for insert in &parsed_pattern.entities {
                if insert.entity_type == "INSERT" && parsed_pattern.blocks.contains_key(&insert.name) && insert.layer.parse::<i32>().is_ok() {
                    pattern.entities.push(insert::Insert {
                        entity_type: entity::EntityTypes::INSERT,
                        layer: insert.layer.parse::<i32>().expect("Expected an integer for layer"),
                        name: insert.name.clone(),
                        position: array![[insert.position.x, insert.position.y]],
                    })
                }
            }
        }

        return pattern;
    }
}