use ndarray::{array, Array2};
use wasm_bindgen::prelude::*;
use web_sys::console;

use crate::block;
use crate::drawing_parameters::IDrawingParameters;
use crate::insert;
use crate::parse_pattern;
use crate::user_settings;
use crate::utils::bounding_box;
use crate::utils::memory::{IndexBuffer, VertexBuffer};
use crate::utils::parse;

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

    fn update_draw_sequence_model(
        &self,
        settings: &mut user_settings::ISettings,
        vertex_buffer: &mut VertexBuffer,
        index_buffer: &mut IndexBuffer,
    ) {
        let mut last_index: u32 = 0;
        let mut nr_entities: u32 = 0;

        let drawing_parameters: IDrawingParameters = settings.get_drawing_pass_parameters();

        for block in self.blocks.iter() {
            let offset: Array2<f32> = self.get_offset_for_block(&block.name);
            block.update_draw_sequence(
                &offset,
                &settings,
                &drawing_parameters,
                &mut last_index,
                &mut nr_entities,
                vertex_buffer,
                index_buffer,
            )
        }

        settings.highlight_nr_selected_entities = nr_entities;
    }

    fn update_draw_sequence_block(
        &self,
        settings: &mut user_settings::ISettings,
        block_name: &String,
        vertex_buffer: &mut VertexBuffer,
        index_buffer: &mut IndexBuffer,
    ) {
        let mut last_index: u32 = 0;
        let mut nr_entities: u32 = 0;

        if let Some(block) = self.block_in_pattern(&block_name) {
            let offset = Array2::zeros((1, 2));

            let drawing_parameters: IDrawingParameters = settings.get_drawing_pass_parameters();

            block.update_draw_sequence(
                &offset,
                &settings,
                &drawing_parameters,
                &mut last_index,
                &mut nr_entities,
                vertex_buffer,
                index_buffer,
            );
        }

        settings.highlight_nr_selected_entities = nr_entities;
    }

    pub(crate) fn update_draw_sequence(
        &self,
        settings: &mut user_settings::ISettings,
        vertex_buffer: &mut VertexBuffer,
        index_buffer: &mut IndexBuffer,
    ) {
        // View with name Block=>L-1 will attempt to draw L-1
        if let Some(block_key) = parse::view_as_block_key(&settings.view) {
            self.update_draw_sequence_block(settings, &block_key, vertex_buffer, index_buffer);
        } else {
            self.update_draw_sequence_model(settings, vertex_buffer, index_buffer);
        }
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
            block.remove_highlight();
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

    pub(crate) fn find_blocks_with_point(
        &self,
        point: &(f32, f32),
        settings: &user_settings::ISettings,
    ) -> Vec<String> {
        let mut selected_block_keys: Vec<String> = vec![];

        for block in self.blocks.iter() {
            let offset = self.get_offset_for_block(&block.name);
            let offset_point = (point.0 - offset[(0, 0)], point.1 - offset[(0, 1)]);

            if block.point_in_bounding_box(&offset_point, settings.point_threshold) {
                selected_block_keys.push(block.name.clone());
            }
        }

        return selected_block_keys;
    }

    pub(crate) fn find_blocks_with_bbox(
        &self,
        bbox: &((f32, f32), (f32, f32)),
        view: &String,
    ) -> (Vec<String>, Option<((f32, f32), (f32, f32))>) {
        let mut selected_block_keys: Vec<String> = vec![];
        let mut union_box = Option::None;
        let view_single_block_key = parse::view_as_block_key(view); // Will be block name if viewing one block

        for block in self.blocks.iter() {
            let offset: Array2<f32>;
            if let Some(key) = &view_single_block_key {
                if &block.name != key {
                    continue; // Skip current block is viewing only one block with a different name to this
                }
                offset = array![[0., 0.]];
            } else {
                offset = self.get_offset_for_block(&block.name);
            }

            let offset_bbox = bounding_box::offset_bbox(block.get_bounding_box(), &offset);

            if bounding_box::intersect(&offset_bbox, bbox) {
                selected_block_keys.push(block.name.clone());
                if let Some(current_union) = union_box {
                    union_box = Some(bounding_box::union(&current_union, &offset_bbox));
                } else {
                    union_box = Some(offset_bbox);
                }
            }
        }

        return (selected_block_keys, union_box);
    }

    pub(crate) fn highlight_selection(&mut self, block_keys: &Vec<String>) {
        self.reset_selection();

        for block in self.blocks.iter_mut() {
            if block_keys.contains(&block.name) {
                block.highlight();
            }
        }
    }

    pub(crate) fn set_highlight(&mut self, block_key: &String, status: bool) -> bool {
        let mut block_exists = false;
        for block in self.blocks.iter_mut() {
            if block_key == &block.name {
                block_exists = true;
                if status {
                    block.highlight();
                } else {
                    block.remove_highlight();
                }
                break;
            }
        }
        return block_exists;
    }

    pub(crate) fn offset_highlighted_objects(&mut self, offset: (f32, f32), view: &String) {
        let (x, y) = offset;
        let arr_offset: Array2<f32> = array![[x, y]];
        let view_single_block_key = parse::view_as_block_key(view);

        for block in self.blocks.iter_mut() {
            if !block.is_highlighted() {
                continue;
            }
            if view_single_block_key != Option::None {
                // If looking at single block, offset entities in block
                block.offset_entities(&arr_offset);
                break;
            }
            for insert in self.entities.iter_mut() {
                if insert.name == block.name {
                    insert.position += &arr_offset;
                }
            }
            // ToDo - else check individual entities
        }
    }

    pub(crate) fn scale_highlighted_objects(
        &mut self,
        scale: &ndarray::Array2<f32>,
        anchor: &ndarray::Array2<f32>,
        view: &String,
    ) {
        let view_single_block_key = parse::view_as_block_key(view);

        for block in self.blocks.iter_mut() {
            if !block.is_highlighted() {
                continue;
            }
            if view_single_block_key != Option::None {
                // If looking at single block, offset entities in block
                block.scale_entities(scale, anchor);
                break;
            }
            // ToDo, Since block does not own its offset, can't safely use a function here
            // Add a cached offset to a block
            let mut offset: &Array2<f32> = &array![[0., 0.]];
            for insert in self.entities.iter() {
                if insert.name == block.name {
                    offset = &insert.position;
                    break;
                }
            }
            let offset_anchor = anchor - offset;
            block.scale_entities(scale, &offset_anchor);
            // ToDo - else check individual entities
        }
    }

    pub(crate) fn rotate_highlights(
        &mut self,
        rot_matrix: &ndarray::Array2<f32>,
        rot_offset: &ndarray::Array2<f32>,
        view: &String,
    ) {
        let view_single_block_key = parse::view_as_block_key(view);

        for block in self.blocks.iter_mut() {
            if !block.is_highlighted() {
                continue;
            }
            if view_single_block_key != Option::None {
                // If looking at single block, offset entities in block
                block.rotate_entities(rot_matrix, rot_offset);
                break;
            }

            let mut offset: &Array2<f32> = &array![[0., 0.]];
            for insert in self.entities.iter() {
                if insert.name == block.name {
                    offset = &insert.position;
                    break;
                }
            }
            let offset_rot_center: Array2<f32> = rot_offset - offset + offset.dot(rot_matrix);
            block.rotate_entities(rot_matrix, &offset_rot_center);
            // ToDo - else check individual entities
        }
    }

    pub(crate) fn get_highlighted_bounding_box(
        &mut self,
        view: &String,
    ) -> Option<((f32, f32), (f32, f32))> {
        let view_single_block_key = parse::view_as_block_key(view);
        let mut output: Option<((f32, f32), (f32, f32))> = Option::None;

        for block in self.blocks.iter_mut() {
            if !block.is_highlighted() {
                continue;
            }
            if view_single_block_key != Option::None {
                // If looking at single block, offset entities in block
                return Some(block.get_bounding_box().clone());
            }

            let mut offset: Array2<f32> = array![[0., 0.]];
            for insert in self.entities.iter() {
                if insert.name == block.name {
                    offset = insert.position.clone();
                    break;
                }
            }
            let bbox = block.get_bounding_box();
            let offset_bbox = bounding_box::offset_bbox(bbox, &offset);

            if let Some(union_bbox) = output {
                output = Some(bounding_box::union(&offset_bbox, &union_bbox));
            } else {
                output = Some(offset_bbox);
            }
            // ToDo - else check individual entities
        }
        return output;
    }
}
