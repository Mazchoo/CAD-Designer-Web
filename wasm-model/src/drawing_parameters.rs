// Struct that determines behaviour of a drawing pass
use ndarray::Array2;

#[derive(Debug)]
pub struct IDrawingParameters {
    pub highlight_offset: Array2<f32>,
    pub highlight_scale: Array2<f32>,
    pub highlight_anchor: Array2<f32>,
    pub highlight_rot_matrix: Array2<f32>,
    pub rot_center: Array2<f32>,
    pub highlight_rot_offset: Array2<f32>,
}
