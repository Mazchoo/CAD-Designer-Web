use wasm_bindgen::prelude::*;
use leptos::*;

pub mod parse_pattern;

#[wasm_bindgen]
pub fn read_pattern(json_payload: &str) {
    if let Ok(_pattern) = parse_pattern::parse_pattern(json_payload) {
        logging::log!("Parsed the pattern");
    } else {
        logging::log!("Parsing failed");
    }
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    logging::log!("Hello to the console {}", name);
}

#[component]
fn App() -> impl IntoView {
    let (count, set_count) = create_signal(0);

    view! {
        <button
            on:click=move |_| {
                // on stable, this is set_count.set(3);
                set_count(count() + 1);
                mount_to_body(|| view!{ <p> "That is cool" </p> })
            }
            class:red=move || count() % 2 == 1 // Will toggle a class
        >
            "Click me: "
            // on stable, this is move || count.get();
            {move || count()}
        </button>
    }
}

#[wasm_bindgen]
pub fn get_buffer_udpate() -> Vec<f32> {
    return vec![1., 1. , 1., 10.];
}

#[wasm_bindgen]
pub fn do_more_stuff() {
    logging::log!("Hello to the console");
    console_error_panic_hook::set_once();
    mount_to_body(|| view!{ 
        <App/>
        <p> "Hello there, you noob!"</p>
    });
}
