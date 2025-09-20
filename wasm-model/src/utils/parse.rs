// Return block key if view is named to refer to block
pub fn view_as_block_key(view: &String) -> Option<String> {
    if view.split("=>").next() == Some("Block") {
        if let Some(ind) = view.find("=>") {
            return Some(view[(ind + "=>".len())..].to_string());
        }
    }
    return Option::None;
}
