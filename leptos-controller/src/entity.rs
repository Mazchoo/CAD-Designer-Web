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
    pub entity_type: EntityTypes,
    pub layer: i32,
    pub shape: bool,
    pub vertices: Array2<f32>,
    pub text_height: f32,
    pub entity_index: [u8; 32],
    pub text: String,
}
