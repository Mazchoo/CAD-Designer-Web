pub struct VertexBuffer {
    pub buffer: Vec<f32>,
}

impl VertexBuffer {
    pub fn new() -> VertexBuffer {
        VertexBuffer { buffer: vec![] }
    }

    pub fn get_ptr(&self) -> *const f32 {
        self.buffer.as_ptr()
    }

    pub fn get_len(&self) -> usize {
        return self.buffer.len();
    }
}

pub struct IndexBuffer {
    pub buffer: Vec<u32>,
}

impl IndexBuffer {
    pub fn new() -> IndexBuffer {
        IndexBuffer { buffer: vec![] }
    }

    pub fn get_ptr(&self) -> *const u32 {
        return self.buffer.as_ptr();
    }

    pub fn get_len(&self) -> usize {
        return self.buffer.len();
    }
}
