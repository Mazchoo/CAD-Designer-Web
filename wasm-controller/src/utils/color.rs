pub fn hex_to_rgba(hex: &str) -> Result<(f32, f32, f32, f32), String> {
    if hex.len() != 9 || !hex.starts_with('#') {
        return Err("Hex color must be in the format #RRGGBBAA".into());
    }

    // Parse each component (RR, GG, BB, AA) from the hex string
    let r = u8::from_str_radix(&hex[1..3], 16).map_err(|_| "Invalid red component")?;
    let g = u8::from_str_radix(&hex[3..5], 16).map_err(|_| "Invalid green component")?;
    let b = u8::from_str_radix(&hex[5..7], 16).map_err(|_| "Invalid blue component")?;
    let a = u8::from_str_radix(&hex[7..9], 16).map_err(|_| "Invalid alpha component")?;

    // Convert to f32 and normalize to the range 0.0 - 1.0
    Ok((
        r as f32 / 255.0,
        g as f32 / 255.0,
        b as f32 / 255.0,
        a as f32 / 255.0,
    ))
}
