use ndarray::Array2;
use wasm_bindgen::prelude::*;
use web_sys::console;

use crate::block;
use crate::insert;
use crate::parse_pattern;
use crate::user_settings;

#[wasm_bindgen]
#[derive(Debug)]
pub struct Pattern {
    blocks: Vec<block::Block>,
    entities: Vec<insert::Insert>,
}

fn parse_entity_index(entity_ind: &str) -> Option<[u8; 32]> {
    let trimmed_id = entity_ind.replace("-", "");
    if trimmed_id.len() != 32 {
        return None;
    }
    let mut output = [0u8; 32];
    output[..32].copy_from_slice(trimmed_id.as_bytes());
    return Some(output);
}

// Private function, will panic if layer has not been checked beforehand
fn parse_layer(layer: &str) -> i32 {
    return layer.parse::<i32>().expect("Expected an integer for layer");
}

// ToDo - Refector into smaller functions

#[wasm_bindgen]
impl Pattern {
    // Constructor to initialize the struct
    pub fn new(json_payload: String) -> Pattern {
        let mut pattern = Pattern {
            blocks: vec![],
            entities: vec![],
        };

        if let Ok(document) = parse_pattern::parse_pattern(&json_payload) {
            let parsed_pattern = document.pattern_json;

            for i in &parsed_pattern.entities {
                if i.entity_type == "INSERT"
                    && parsed_pattern.blocks.contains_key(&i.name)
                    && i.layer.parse::<i32>().is_ok()
                {
                    pattern.entities.push(insert::Insert::new(
                        i.name.clone(),
                        parse_layer(&i.layer),
                        &i.position,
                    ))
                }
            }

            for (block_key, b) in &parsed_pattern.blocks {
                if b.layer.parse::<i32>().is_ok() {
                    let mut new_block =
                        block::Block::new(block_key.clone(), parse_layer(&b.layer), &b.centroid);

                    for e in b.entities.iter().filter(|e| e.layer.parse::<i32>().is_ok()) {
                        let entity_id = parse_entity_index(&e.entity_index);
                        if entity_id.is_none() {
                            console::log_1(&format!("Invalid entity Id {}", e.entity_index).into());
                            continue;
                        }

                        if e.entity_type == "POINT" {
                            if e.position.is_none() {
                                console::log_1(
                                    &format!("No position defined {}", e.entity_index).into(),
                                );
                                continue;
                            }
                            new_block.add_point(
                                parse_layer(&e.layer),
                                e.position.as_ref().unwrap(),
                                entity_id.unwrap(),
                            );
                        } else if e.entity_type == "LINE" || e.entity_type == "LWLINE" {
                            if e.vertices.is_none() || e.vertices.as_ref().unwrap().len() != 2 {
                                console::log_1(
                                    &format!("Invalid line vertices {}", e.entity_index).into(),
                                );
                                continue;
                            }
                            let vertices = e.vertices.as_ref().unwrap();
                            new_block.add_line(parse_layer(&e.layer), vertices, entity_id.unwrap());
                        } else if e.entity_type == "POLYLINE" || e.entity_type == "LWPOLYLINE" {
                            if e.vertices.is_none() || e.vertices.as_ref().unwrap().len() == 0 {
                                console::log_1(
                                    &format!("Invalid polyline vertices {}", e.entity_index).into(),
                                );
                                continue;
                            }

                            let mut shape: bool = false;
                            if let Some(e_shape) = e.shape {
                                shape = e_shape;
                            }

                            new_block.add_polyline(
                                parse_layer(&e.layer),
                                shape,
                                entity_id.unwrap(),
                                e.vertices.as_ref().unwrap(),
                            );
                        } else if e.entity_type == "TEXT" {
                            if e.start_point.is_none()
                                || e.text_height.is_none()
                                || e.text.is_none()
                            {
                                console::log_1(
                                    &format!("Invalid text entity {}", e.entity_index).into(),
                                );
                                continue;
                            }
                            new_block.add_text(
                                parse_layer(&e.layer),
                                e.start_point.as_ref().unwrap(),
                                entity_id.unwrap(),
                                e.text_height.unwrap(),
                                e.text.clone().unwrap(),
                            )
                        } else {
                            console::log_1(
                                &format!("Invalid entity type {}", e.entity_type).into(),
                            );
                        }
                    }

                    new_block.update_bounding_box();
                    pattern.blocks.push(new_block);
                } else {
                    console::log_1(&format!("Invalid layer {}", b.layer).into());
                }
            }
        }

        return pattern;
    }

    pub fn get_number_blocks(&self) -> usize {
        return self.blocks.len();
    }

    pub fn get_number_inserts(&self) -> usize {
        return self.entities.len();
    }

    pub fn get_number_entities(&self) -> usize {
        return self.blocks.iter().map(|b| b.get_number_entities()).sum();
    }

    pub(crate) fn get_offset_for_block(&self, block_key: &String) -> Array2<f32> {
        for insert in self.entities.iter() {
            if &insert.name == block_key {
                return insert.position.clone();
            };
        }

        console::log_1(&format!("Block key {} not in inserts", block_key).into());
        return Array2::zeros((1, 2));
    }

    fn get_draw_sequence_model(&self, settings: &user_settings::Settings) -> (Vec<f32>, Vec<u32>) {
        let mut vertex_buffer: Vec<f32> = vec![];
        let mut index_buffer: Vec<u32> = vec![];
        let mut last_index: u32 = 0;

        for block in self.blocks.iter() {
            let offset = self.get_offset_for_block(&block.name);
            block.get_draw_sequence(
                &offset,
                &settings,
                &mut last_index,
                &mut vertex_buffer,
                &mut index_buffer,
            )
        }

        return (vertex_buffer, index_buffer);
    }

    fn get_draw_sequence_block(
        &self,
        settings: &user_settings::Settings,
        block_name: &String,
    ) -> (Vec<f32>, Vec<u32>) {
        let mut vertex_buffer: Vec<f32> = vec![];
        let mut index_buffer: Vec<u32> = vec![];
        let mut last_index: u32 = 0;

        if let Some(block) = self.block_in_pattern(&block_name) {
            let offset = Array2::zeros((1, 2));
            block.get_draw_sequence(
                &offset,
                &settings,
                &mut last_index,
                &mut vertex_buffer,
                &mut index_buffer,
            )
        }

        return (vertex_buffer, index_buffer);
    }

    pub(crate) fn get_draw_sequence(
        &self,
        settings: &user_settings::Settings,
    ) -> (Vec<f32>, Vec<u32>) {
        // View with name Block=>L-1 will attempt to draw L-1
        if settings.view.split("=>").next() == Some("Block") {
            if let Some(ind) = settings.view.find("=>") {
                let key = settings.view[(ind + "=>".len())..].to_string();
                console::log_1(&format!("Switching view to {}", key).into());
                return self.get_draw_sequence_block(settings, &key);
            }
        }

        return self.get_draw_sequence_model(settings);
    }

    pub(crate) fn block_in_pattern(&self, block_name: &String) -> Option<&block::Block> {
        for block in self.blocks.iter() {
            if &block.name == block_name {
                return Some(block);
            }
        }
        console::log_1(&format!("Block key {} not in pattern", block_name).into());
        return None;
    }

    pub fn reset_selection(&mut self) {
        for block in self.blocks.iter_mut() {
            block.reset_selection();
        }
    }

    pub fn get_all_layers(&self) -> Vec<i32> {
        let mut output: Vec<i32> = vec![];

        for block in self.blocks.iter() {
            block.get_all_layers(&mut output);
        }
        output.sort();

        return output;
    }

    pub fn get_all_block_names(&self) -> Vec<String> {
        let mut output: Vec<String> = vec![];

        for block in self.blocks.iter() {
            output.push(block.name.clone());
        }
        output.sort();

        return output;
    }
}
