
![image](https://github.com/user-attachments/assets/953a28d0-7d6e-44d3-95b3-62b93d5b23db)

# About

This is a Proof of Concept for running cad software in the browser using Web GPU and Wasm in order to take advantage of numeric computations in the browser in lower level languages. Rendering of the dxf is done on the GPU and more customised object manipulation can be done with Rust Bindings.

# GPU Requirements

The browser must support usage of the GPU for the display to work.

# Development Information

Use `npm run build-rust` to update the wasm package. This does not happen automatically when rollup runs, rollup can only copy the wasm file into the distribution. There is typescript generated for the wasm which can infer types.

Use `npm run server-debug` to run the server on local host.

Search user settings in the command pallette with Ctrl + Shift + P
Then add the following entry to the settings
"rust-analyzer.procMacro.ignored": {
"leptos_macro": [
// optional:
// "component",
"server"
],
}

### Rust General Usability notes

- Creating tests is the best way to debug a feature in isolation. Tests compile separately to the release wasm.
- Currently wasm binding classes have to have all private variables (this is good practice any way) as making them public will mean that wasm will expect those classes to be convertible to a js equivalent.
