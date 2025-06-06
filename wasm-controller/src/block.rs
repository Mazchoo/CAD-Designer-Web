use ndarray::{array, Array2};

use crate::entity;
use crate::parse_pattern;
use crate::user_settings;
use crate::utils::bounding_box;
use crate::utils::color;
use crate::utils::memory;

#[derive(Debug)]
pub struct Block {
    pub name: String,
    centroid: Array2<f32>,
    layer: i32,
    entities: Vec<entity::Entity>,
    // Cached variables
    bounding_box: ((f32, f32), (f32, f32)),
    // display variables
    highlighted: bool,
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
            highlighted: false,
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
            let ((new_min_x, new_max_x), (new_min_y, new_max_y)) = entity.bounding_box;
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

    pub fn update_bounding_box(&mut self) -> &((f32, f32), (f32, f32)) {
        self.bounding_box = self.calculate_bounding_box();
        return &self.bounding_box;
    }

    pub fn get_bounding_box(&self) -> &((f32, f32), (f32, f32)) {
        return &self.bounding_box;
    }

    pub fn point_in_bounding_box(&self, point: &(f32, f32), padding: f32) -> bool {
        return bounding_box::contains_point(&self.bounding_box, point, padding);
    }

    pub fn bbox_intersects_block(&self, bbox: &((f32, f32), (f32, f32))) -> bool {
        return bounding_box::intersect(&self.bounding_box, bbox);
    }

    pub fn update_draw_sequence(
        &self,
        offset: &Array2<f32>,
        settings: &user_settings::Settings,
        highlight_offset: &Array2<f32>,
        highlight_scale: &Array2<f32>,
        highlight_anchor: &Array2<f32>,
        highlight_rot_matrix: &Array2<f32>,
        highlight_rot_offset: &Array2<f32>,
        last_index: &mut u32,
        vertex_buffer: &mut memory::VertexBuffer,
        index_buffer: &mut memory::IndexBuffer,
    ) {
        let block_color = color::rbga_to_float(self.get_color(settings));
        let total_highlight_offset = highlight_offset + offset;

        for entity in self.entities.iter() {
            if settings.disabled_layers.contains(&entity.layer) {
                continue;
            };
            let entity_color = entity.get_color(settings, &block_color);
            let entity_offset = if entity.highlighted {
                &total_highlight_offset
            } else {
                offset
            };

            entity.update_draw_sequence(
                entity_color,
                entity_offset,
                &highlight_scale,
                &highlight_anchor,
                &highlight_rot_offset,
                &highlight_rot_matrix,
                &settings.cross_size,
                last_index,
                vertex_buffer,
                index_buffer,
            );
        }
    }

    pub fn get_all_layers(&self, layers: &mut Vec<i32>) {
        if !layers.contains(&self.layer) {
            layers.push(self.layer);
        }

        for entity in self.entities.iter() {
            if !layers.contains(&entity.layer) {
                layers.push(entity.layer);
            }
        }
    }

    fn get_color<'a>(&self, settings: &'a user_settings::Settings) -> &'a (u8, u8, u8, u8) {
        let mut block_color: &(u8, u8, u8, u8) = &settings.default_color;
        if settings.layer_colors.contains_key(&self.layer) {
            block_color = &settings.layer_colors[&self.layer]
        };
        return block_color;
    }

    pub fn is_highlighted(&self) -> bool {
        return self.highlighted;
    }

    pub fn highlight(&mut self) {
        self.highlighted = true;
        for entity in self.entities.iter_mut() {
            entity.highlighted = true;
        }
    }

    pub fn remove_highlight(&mut self) {
        self.highlighted = false;
        for entity in self.entities.iter_mut() {
            entity.remove_highlight();
        }
    }

    pub fn offset_entities(&mut self, offset: &Array2<f32>) {
        for entity in self.entities.iter_mut() {
            entity.offset_vertices(offset);
        }
        self.bounding_box = bounding_box::offset_bbox(&self.bounding_box, offset);
    }

    pub fn scale_entities(&mut self, scale: &Array2<f32>, anchor: &Array2<f32>) {
        for entity in self.entities.iter_mut() {
            entity.scale_vertices(scale, anchor);
        }
        self.bounding_box = bounding_box::scale_bbox(&self.bounding_box, scale, anchor);
    }

    pub fn rotate_entities(&mut self, rot_matrix: &Array2<f32>, rot_center: &Array2<f32>) {
        for entity in self.entities.iter_mut() {
            entity.rotate_vertices(rot_matrix, rot_center);
        }
        self.bounding_box = self.calculate_bounding_box();
    }
}
