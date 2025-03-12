use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct VertexBuffer {
    buffer: Vec<f32>
}

#[wasm_bindgen]
impl VertexBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> VertexBuffer {
        VertexBuffer {
            buffer: vec![], // Example f32 values
        }
    }

    #[wasm_bindgen]
    pub fn get_ptr(&self) -> *const f32 {
        self.buffer.as_ptr()
    }

    #[wasm_bindgen]
    pub fn get_len(&self) -> usize {
        return self.buffer.len();
    }

    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.buffer.clear();
    }
}

#[wasm_bindgen]
pub struct IndexBuffer {
    buffer: Vec<i32>
}

#[wasm_bindgen]
impl IndexBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> IndexBuffer {
        IndexBuffer {
            buffer: vec![], // Example f32 values
        }
    }

    #[wasm_bindgen]
    pub fn get_ptr(&self) -> *const i32 {
        return self.buffer.as_ptr();
    }

    #[wasm_bindgen]
    pub fn get_len(&self) -> usize {
        return self.buffer.len();
    }

    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.buffer.clear();
    }
}