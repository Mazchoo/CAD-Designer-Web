![image](https://github.com/user-attachments/assets/953a28d0-7d6e-44d3-95b3-62b93d5b23db)

# Introduction

Creates basic cad editing functionality in the browser.
- Can select and move multiple objects
- Can snap objects to other objects
- Can make edits on model level or on block level
- Show basic statistics about the underlying shapes (e.g. surface area)

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
