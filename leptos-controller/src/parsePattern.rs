use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Result;

#[derive(Serialize, Deserialize, Debug)]
struct Vertex {
    x: f64,
    y: f64,
}

#[derive(Serialize, Deserialize, Debug)]
struct ParseEntity {
    #[serde(skip_serializing_if = "Option::is_none")]
    entity_type: Option<String>,  // 'type' is a reserved keyword in Rust
    #[serde(skip_serializing_if = "Option::is_none")]
    shape: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    vertices: Option<Vec<Vertex>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    position: Option<Vertex>,
    #[serde(skip_serializing_if = "Option::is_none")]
    entity_index: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    start_point: Option<Vertex>,
    #[serde(skip_serializing_if = "Option::is_none")]
    text_height: Option<f64>,  // Assuming textHeight can be a float
    #[serde(skip_serializing_if = "Option::is_none")]
    text: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct ParseBlock {
    entities: Vec<ParseEntity>,
    centroid: Vertex,
    layer: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ParseInsertEntity {
    entity_type: String,
    name: String,
    position: Vertex,
    layer: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ParsePattern {
    blocks: HashMap<String, ParseBlock>,
    entities: Vec<ParseInsertEntity>,
}

// Function to parse a JSON string into the Person struct.
fn parse_pattern(json_str: &str) -> Result<ParsePattern> {
    let parsed_pattern: ParsePattern = serde_json::from_str(json_str)?;
    Ok(person)
}
