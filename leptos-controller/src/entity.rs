use ndarray::Array2;

#[derive(Debug)]
pub enum EntityTypes {
    POINT,
    POLYLINE,
    LINE,
    LWPOLYLINE,
    LWLINE,
    TEXT,
    INSERT,
}

#[derive(Debug)]
pub struct Entity {
    entity_type: EntityTypes,
    layer: i32,
    shape: bool,
    vertices: Array2<f64>,
    text_height: f32,
    entity_index: [u8; 32],
    text: String
}
