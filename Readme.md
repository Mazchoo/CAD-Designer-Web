# About

This is a PoC for running cad software in the browser using Web GPU and Wasm to do some numeric computations in the browser in lower level languages.

# GPU Requirements

The browser must support usage of the GPU for the display to work.

# Development Information

Use `npm run build-rust` to update the wasm package. This does not happen automatically when rollup runs, rollup can only copy the wasm file into the distribution. There is typescript generated for the wasm which can infer types.

Use `npm run server-debug` to run the server on local host.

In order to get Leptos working, currently the nightly version of rustup has to be used.

`rustup override set nightly`

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

- Creating tests is the best way to debug a feature in isolation.
- Currently wasm binding classes have to have all private variables (this is good practice any way) as making them public will mean that wasm will expect those classes to be convertible to a js equivalent.
