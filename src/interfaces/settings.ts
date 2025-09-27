// JS side interface of user settings

export interface ISettings {
  default_color: [number, number, number, number]; // Range 0-255
  highlight_color: [number, number, number, number]; // Range 0-255
  disabled_layers: number[]; // Layer id's
  layer_colors: { [layer: number]: string }; // Layer id to hex color
  point_threshold: number; // threshold in model space to select an individual point
  cross_size: number; // How big cross is to denote point entities
  view: string; // Could be made into an enum, current Model and every block
  highlight_offset: [number, number]; // offset of current selection
  highlight_scale: [number, number]; // scale of current selection
  highlight_flip: [boolean, boolean]; // flip status of current selection
  highlight_anchor: [number, number]; // origin to perform scaling
  highlight_rotation_center: [0, 0]; // origin to perform rotation
  highlight_rotation_angle: 0; // Rotation angle in radians
  highlight_nr_selected_entities: 0; // Number of objects selected in highlight
}
