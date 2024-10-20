use ndarray::{array, Array2};

use crate::entity;
use crate::parse_pattern;

#[derive(Debug)]
pub struct Block {
    centroid: Array2<f32>,
    layer: i32,
    entities: Vec<entity::Entity>,
    name: String,
}

impl Block {
    pub fn new(name: String, layer: i32, center: &parse_pattern::Vertex) -> Block {
        return Block {
            layer: layer,
            entities: vec![],
            name: name,
            centroid: array![[center.x, center.y]],
        };
    }

    pub fn add_point(&mut self, layer: i32, position: &parse_pattern::Vertex, entity_id: [u8; 32]) {
        self.entities.push(entity::Entity {
            entity_type: entity::EntityTypes::POINT,
            shape: false,
            layer: layer,
            vertices: array![[position.x, position.y]],
            entity_index: entity_id,
            text_height: 0.,
            text: "".to_string(),
        })
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
        self.entities.push(entity::Entity {
            entity_type: entity::EntityTypes::LINE,
            shape: false,
            layer: layer,
            vertices: arr,
            entity_index: entity_id,
            text_height: 0.,
            text: "".to_string(),
        })
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

        self.entities.push(entity::Entity {
            entity_type: entity::EntityTypes::LINE,
            shape: shape,
            layer: layer,
            vertices: arr,
            entity_index: entity_id,
            text_height: 0.,
            text: "".to_string(),
        })
    }

    pub fn add_text(
        &mut self,
        layer: i32,
        position: &parse_pattern::Vertex,
        entity_id: [u8; 32],
        text_height: f32,
        text: String,
    ) {
        self.entities.push(entity::Entity {
            entity_type: entity::EntityTypes::TEXT,
            shape: false,
            layer: layer,
            vertices: array![[position.x, position.y]],
            entity_index: entity_id,
            text_height: text_height,
            text: text,
        })
    }

    pub fn get_number_entities(&self) -> usize {
        return self.entities.len();
    }
}
