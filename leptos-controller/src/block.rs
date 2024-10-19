use ndarray::Array2;

use crate::entity;

#[derive(Debug)]
pub struct Block {
    centroid: Array2<f32>,
    layer: i32,
    entities: Vec<entity::Entity>
}
