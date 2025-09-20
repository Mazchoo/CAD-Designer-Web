pub fn hex_to_rgba(hex: &str) -> Result<(u8, u8, u8, u8), String> {
    if hex.len() != 9 || !hex.starts_with('#') {
        return Err("Hex color must be in the format #RRGGBBAA".into());
    }

    // Parse each component (RR, GG, BB, AA) from the hex string
    let r = u8::from_str_radix(&hex[1..3], 16).map_err(|_| "Invalid red component")?;
    let g = u8::from_str_radix(&hex[3..5], 16).map_err(|_| "Invalid green component")?;
    let b = u8::from_str_radix(&hex[5..7], 16).map_err(|_| "Invalid blue component")?;
    let a = u8::from_str_radix(&hex[7..9], 16).map_err(|_| "Invalid alpha component")?;

    // Convert to f32 and normalize to the range 0.0 - 1.0
    Ok((r, g, b, a))
}

pub fn rbga_to_float(rgba: &(u8, u8, u8, u8)) -> f32 {
    let (r, g, b, a) = rgba;
    let packed_integer: u32 =
        ((*r as u32) << 24) | ((*g as u32) << 16) | ((*b as u32) << 8) | (*a as u32);
    return f32::from_bits(packed_integer);
}
