
let SETTINGS = {
    default_color: [0., 0., 0., 1.],
    highlight_color: [0., 0., 1., 1.],
    select_color: [1., 0., 0., 1.],
    layer_colors: {},
    point_threshold: 1.,
    cross_size: 0.3,
    view: "Model"
}

export const LAYER_TO_NAME: {[layer: number]: string} = {
    0: "Unknown",
    1: "Seam",
    2: "TurnPoint",
    3: "CurvePoint",
    4: "Notch",
    5: "Reference",
    6: "Mirror",
    7: "Grain",
    8: "Markup",
    9: "Stripe",
    10: "Plaid",
    11: "Cut",
    12: "Placeholder",
    13: "DrillHole",
    14: "Stitch"
}

export function getSettingsPayload(): string {
    return JSON.stringify(SETTINGS);
}
