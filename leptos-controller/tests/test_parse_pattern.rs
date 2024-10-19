use std::fs;
use std::path::Path;

use cad_pattern_editor::parse_pattern;

#[test]
fn test_parse_json_from_example_file() {
    let path = Path::new("../example_input/shirt.json");

    let json_payload: String = fs::read_to_string(path).expect("Unable to read JSON file");

    let result = parse_pattern::parse_pattern(&json_payload);

    assert!(result.is_ok())
}