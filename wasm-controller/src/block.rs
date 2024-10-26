use ndarray::{array, Array2};
use std::collections::HashMap;
use web_sys::console;

use crate::entity;
use crate::parse_pattern;
use crate::user_settings;
use crate::utils::bounding_box;

#[derive(Debug)]
pub struct Block {
    pub name: String,
    centroid: Array2<f32>,
    layer: i32,
    entities: Vec<entity::Entity>,
    // Cached variables
    bounding_box: ((f32, f32), (f32, f32)),

    // Display variables
    selected: bool,
    hightlighted: bool,
}

impl Block {
    pub fn new(name: String, layer: i32, center: &parse_pattern::Vertex) -> Block {
        let bounding_box: ((f32, f32), (f32, f32)) = ((0., 0.), (0., 0.));
        return Block {
            layer: layer,
            entities: vec![],
            name: name,
            centroid: array![[center.x, center.y]],
            bounding_box: bounding_box,
            selected: false,
            hightlighted: false,
        };
    }

    pub fn add_point(&mut self, layer: i32, position: &parse_pattern::Vertex, entity_id: [u8; 32]) {
        self.entities.push(entity::Entity::new(
            entity::EntityTypes::POINT,
            layer,
            false,
            array![[position.x, position.y]],
            0.,
            entity_id,
            "".to_string(),
        ))
    }

    pub fn add_line(
        &mut self,
        layer: i32,
        vertices: &Vec<parse_pattern::Vertex>,
        entity_id: [u8; 32],
    ) {
        let arr = array![
            [vertices[0].x, vertices[0].y],
            [vertices[1].x, vertices[1].y]
        ];
        self.entities.push(entity::Entity::new(
            entity::EntityTypes::LINE,
            layer,
            false,
            arr,
            0.,
            entity_id,
            "".to_string(),
        ))
    }

    pub fn add_polyline(
        &mut self,
        layer: i32,
        shape: bool,
        entity_id: [u8; 32],
        vertices: &Vec<parse_pattern::Vertex>,
    ) {
        let mut vertex_data: Vec<f32> = Vec::new();
        for vertex in vertices {
            vertex_data.push(vertex.x);
            vertex_data.push(vertex.y);
        }
        let num_points = vertices.len();
        let arr: Array2<f32> = Array2::from_shape_vec((num_points, 2), vertex_data).unwrap();

        self.entities.push(entity::Entity::new(
            entity::EntityTypes::LINE,
            layer,
            shape,
            arr,
            0.,
            entity_id,
            "".to_string(),
        ))
    }

    pub fn add_text(
        &mut self,
        layer: i32,
        position: &parse_pattern::Vertex,
        entity_id: [u8; 32],
        text_height: f32,
        text: String,
    ) {
        self.entities.push(entity::Entity::new(
            entity::EntityTypes::TEXT,
            layer,
            false,
            array![[position.x, position.y]],
            text_height,
            entity_id,
            text,
        ))
    }

    pub fn get_number_entities(&self) -> usize {
        return self.entities.len();
    }

    fn calculate_bounding_box(&self) -> ((f32, f32), (f32, f32)) {
        let mut min_x = f32::INFINITY;
        let mut min_y = f32::INFINITY;
        let mut max_x = f32::NEG_INFINITY;
        let mut max_y = f32::NEG_INFINITY;

        for entity in self.entities.iter() {
            let ((new_min_x, new_min_y), (new_max_x, new_max_y)) = entity.bounding_box;
            min_x = min_x.min(new_min_x);
            max_x = max_x.max(new_max_x);
            min_y = min_y.min(new_min_y);
            max_y = max_y.max(new_max_y);
        }

        if min_x == f32::INFINITY {
            min_x = 0.;
            max_x = 0.;
            min_y = 0.;
            max_y = 0.;
        }

        return ((min_x, max_x), (min_y, max_y));
    }

    pub fn update_bounding_box(&mut self) {
        self.bounding_box = self.calculate_bounding_box();
    }

    pub fn point_in_bounding_box(&self, point: &(f32, f32), padding: f32) -> bool {
        return bounding_box::point_in_bounding_box(&self.bounding_box, point, padding);
    }

    pub fn get_draw_sequence(
        &self,
        offset: &Array2<f32>,
        settings: &user_settings::Settings,
        last_index: &mut u32,
        vertex_buffer: &mut Vec<f32>,
        index_buffer: &mut Vec<u32>,
    ) {
        let block_color = self.get_color(settings);

        for entity in self.entities.iter() {
            let entity_color = entity.get_color(settings, block_color);

            entity.get_draw_sequence(
                entity_color,
                offset,
                &settings.cross_size,
                last_index,
                vertex_buffer,
                index_buffer,
            );
        }
    }

    pub fn reset_selection(&mut self) {
        self.selected = false;
        self.hightlighted = false;
        for entity in self.entities.iter_mut() {
            entity.reset_selection();
        }
    }

    pub fn get_all_layers(&self, layers: &mut Vec<i32>) {
        if !layers.contains(&self.layer) {
            layers.push(self.layer);
        }

        for entity in self.entities.iter() {
            if !layers.contains(&entity.layer) {
                layers.push(entity.layer);
            }
        }
    }

    fn get_color<'a>(&self, settings: &'a user_settings::Settings) -> &'a (f32, f32, f32, f32) {
        let mut block_color: &(f32, f32, f32, f32) = &settings.default_color;
        if self.selected {
            block_color = &settings.select_color;
        } else if self.hightlighted {
            block_color = &settings.highlight_color;
        } else if settings.layer_colors.contains_key(&self.layer) {
            block_color = &settings.layer_colors[&self.layer]
        };
        return block_color;
    }
}
