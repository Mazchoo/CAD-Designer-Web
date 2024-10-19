use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Result;

#[derive(Serialize, Deserialize, Debug)]
pub struct Vertex {
    pub x: f32,
    pub y: f32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParseEntity {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shape: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vertices: Option<Vec<Vertex>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub position: Option<Vertex>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub entity_index: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start_point: Option<Vertex>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text_height: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParseBlock {
    pub entities: Vec<ParseEntity>,
    pub centroid: Vertex,
    pub layer: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParseInsertEntity {
    pub entity_type: String,
    pub name: String,
    pub position: Vertex,
    pub layer: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParsePattern {
    pub blocks: HashMap<String, ParseBlock>,
    pub entities: Vec<ParseInsertEntity>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParseDocument {
    pub pattern_json: ParsePattern,
}

// Function to parse a JSON string into the Person struct.
pub fn parse_pattern(json_str: &str) -> Result<ParseDocument> {
    let parsed_pattern: ParseDocument = serde_json::from_str(json_str)?;
    Ok(parsed_pattern)
}
