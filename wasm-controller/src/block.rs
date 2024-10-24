use ndarray::{array, Array2};

use crate::entity;
use crate::parse_pattern;
use crate::utils::bounding_box;

#[derive(Debug)]
pub struct Block {
    centroid: Array2<f32>,
    layer: i32,
    entities: Vec<entity::Entity>,
    name: String,
    // Cached variables
    bounding_box: ((f32, f32), (f32, f32)),
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

    pub fn get_draw_sequence(&self) {}
}
