use ndarray::{array, Array2};

pub fn from_array(vertices: &Array2<f32>) -> ((f32, f32), (f32, f32)) {
    let mut min_x: f32 = f32::INFINITY;
    let mut min_y: f32 = f32::INFINITY;
    let mut max_x: f32 = f32::NEG_INFINITY;
    let mut max_y: f32 = f32::NEG_INFINITY;

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

pub fn contains_point(bbox: &((f32, f32), (f32, f32)), p: &(f32, f32), padding: f32) -> bool {
    let ((min_x, max_x), (min_y, max_y)) = bbox;
    return p.0 >= min_x - padding
        && p.0 <= max_x + padding
        && p.1 >= min_y - padding
        && p.1 <= max_y + padding;
}

pub fn offset_bbox(
    bbox: &((f32, f32), (f32, f32)),
    offset: &Array2<f32>,
) -> ((f32, f32), (f32, f32)) {
    let ((min_x, max_x), (min_y, max_y)) = bbox;
    return (
        (min_x + offset[(0, 0)], max_x + offset[(0, 0)]),
        (min_y + offset[(0, 1)], max_y + offset[(0, 1)]),
    );
}

pub fn scale_bbox(
    bbox: &((f32, f32), (f32, f32)),
    scale: &Array2<f32>,
    anchor: &Array2<f32>,
) -> ((f32, f32), (f32, f32)) {
    let ((min_x, max_x), (min_y, max_y)) = bbox;
    return (
        (
            (min_x - anchor[(0, 0)]) * scale[(0, 0)] + anchor[(0, 0)],
            (max_x - anchor[(0, 0)]) * scale[(0, 0)] + anchor[(0, 0)],
        ),
        (
            (min_y - anchor[(0, 1)]) * scale[(0, 1)] + anchor[(0, 1)],
            (max_y - anchor[(0, 1)]) * scale[(0, 1)] + anchor[(0, 1)],
        ),
    );
}

pub fn rotate_bbox(
    bbox: &((f32, f32), (f32, f32)),
    rot_matrix: &Array2<f32>,
    center: &Array2<f32>,
) -> ((f32, f32), (f32, f32)) {
    let offset_center = center + center.dot(rot_matrix);
    let ((min_x, max_x), (min_y, max_y)) = bbox;
    let bottom_right: Array2<f32> =
        array![[min_x.clone(), min_y.clone()]].dot(rot_matrix) + &offset_center;
    let bottom_left: Array2<f32> =
        array![[max_x.clone(), min_y.clone()]].dot(rot_matrix) + &offset_center;
    let top_right: Array2<f32> =
        array![[min_x.clone(), max_y.clone()]].dot(rot_matrix) + &offset_center;
    let top_left: Array2<f32> =
        array![[max_x.clone(), max_y.clone()]].dot(rot_matrix) + &offset_center;
    let xs: [f32; 4] = [
        bottom_right[(0, 0)],
        bottom_left[(0, 0)],
        top_right[(0, 0)],
        top_left[(0, 0)],
    ];
    let ys: [f32; 4] = [
        bottom_right[(0, 1)],
        bottom_left[(0, 1)],
        top_right[(0, 1)],
        top_left[(0, 1)],
    ];
    let min_x: f32 = xs.into_iter().fold(f32::INFINITY, f32::min);
    let max_x: f32 = xs.into_iter().fold(f32::INFINITY, f32::max);
    let min_y: f32 = ys.into_iter().fold(f32::INFINITY, f32::min);
    let max_y: f32 = ys.into_iter().fold(f32::INFINITY, f32::max);
    return ((min_x, max_x), (min_y, max_y));
}

pub fn intersect(bbox1: &((f32, f32), (f32, f32)), bbox2: &((f32, f32), (f32, f32))) -> bool {
    let ((min_x1, max_x1), (min_y1, max_y1)) = bbox1;
    let ((min_x2, max_x2), (min_y2, max_y2)) = bbox2;
    return min_x1 <= max_x2 && min_x2 <= max_x1 && min_y1 <= max_y2 && min_y2 <= max_y1;
}

pub fn union(
    bbox1: &((f32, f32), (f32, f32)),
    bbox2: &((f32, f32), (f32, f32)),
) -> ((f32, f32), (f32, f32)) {
    let ((min_x1, max_x1), (min_y1, max_y1)) = bbox1;
    let ((min_x2, max_x2), (min_y2, max_y2)) = bbox2;
    return (
        (min_x1.min(*min_x2).clone(), max_x1.max(*max_x2).clone()),
        (min_y1.min(*min_y2).clone(), max_y1.max(*max_y2).clone()),
    );
}

pub fn center(bbox: &((f32, f32), (f32, f32))) -> (f32, f32) {
    let ((min_x, max_x), (min_y, max_y)) = bbox;
    return ((min_x + max_x) / 2., (min_y + max_y) / 2.);
}

pub fn construct_from_vectors(v1: Vec<f32>, v2: Vec<f32>) -> Option<((f32, f32), (f32, f32))> {
    if v1.len() != 2 || v2.len() != 2 {
        return Option::None;
    }
    let min_x = v1[0].min(v2[0]);
    let min_y = v1[1].min(v2[1]);
    let max_x = v1[0].max(v2[0]);
    let max_y = v1[1].max(v2[1]);
    return Option::Some(((min_x, max_x), (min_y, max_y)));
}
