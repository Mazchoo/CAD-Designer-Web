use ndarray::Array2;

pub fn calculate_bounding_box(vertices: &Array2<f32>) -> ((f32, f32), (f32, f32)) {
    let mut min_x = f32::INFINITY;
    let mut min_y = f32::INFINITY;
    let mut max_x = f32::NEG_INFINITY;
    let mut max_y = f32::NEG_INFINITY;

    for v in vertices.rows().into_iter() {
        min_x = min_x.min(v[0]);
        max_x = max_x.max(v[0]);
        min_y = min_y.min(v[1]);
        max_y = max_y.max(v[1]);
    }

    if min_x == f32::INFINITY {
        min_x = 0.;
        max_x = 0.;
        min_y = 0.;
        max_y = 0.;
    }

    return ((min_x, max_x), (min_y, max_y));
}

pub fn point_in_bounding_box(
    bbox: &((f32, f32), (f32, f32)),
    p: &(f32, f32),
    padding: f32,
) -> bool {
    let ((min_x, max_x), (min_y, max_y)) = bbox;
    return p.0 >= min_x - padding
        && p.0 <= max_x + padding
        && p.1 >= min_y - padding
        && p.1 <= max_y + padding;
}
