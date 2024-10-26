use std::fs;
use std::path::Path;

use cad_pattern_editor::parse_pattern;
use cad_pattern_editor::pattern;

#[test]
fn test_parse_json_from_example_file() {
    let path = Path::new("../example_input/shirt.json");

    let json_payload: String = fs::read_to_string(path).expect("Unable to read JSON file");

    let result = parse_pattern::parse_pattern(&json_payload);

    assert!(result.is_ok())
}

#[test]
fn test_create_pattern_object_example_file() {
    let path = Path::new("../example_input/shirt.json");

    let json_payload: String = fs::read_to_string(path).expect("Unable to read JSON file");

    let p = pattern::Pattern::new(json_payload);

    assert_eq!(p.get_number_blocks(), 3);
    assert_eq!(p.get_number_inserts(), 3);
    assert_eq!(p.get_number_entities(), 307);
}
