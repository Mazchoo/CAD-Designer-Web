use ndarray::{array, Array2};

use crate::entity;
use crate::parse_pattern;

#[derive(Debug)]
pub struct Insert {
    entity_type: entity::EntityTypes,
    layer: i32,
    name: String,
    position: Array2<f32>,
}

impl Insert {
    pub fn new(name: String, layer: i32, position: &parse_pattern::Vertex) -> Insert {
        return Insert {
            entity_type: entity::EntityTypes::INSERT,
            layer: layer,
            name: name,
            position: array![[position.x, position.y]],
        };
    }
}
