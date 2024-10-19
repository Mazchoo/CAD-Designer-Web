use ndarray::Array2;

use crate::entity;

#[derive(Debug)]
pub struct Insert {
    pub entity_type: entity::EntityTypes,
    pub layer: i32,
    pub name: String,
    pub position: Array2<f32>
}
