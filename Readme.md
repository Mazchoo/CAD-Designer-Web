![image](https://github.com/user-attachments/assets/953a28d0-7d6e-44d3-95b3-62b93d5b23db)

# Introduction

Basic 2D cad editing functionality fully in a web browser.

Currently supports:

- Can select multiple objects
- Can rotate, flip, scale and offset blocks
- Can make edits on model level or on block level

Currently does not support:

- Dragging and grouping entities for editing
- Undoing and redoing operations
- Snap-point functionality
- Precise movement by given amounts e.g. moving up by 1cm exactly

# Set-up for local hosting

Needs the rust compiler to build wasm - https://www.rust-lang.org/tools/install
Needs npm for other packages - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

Run
```
npm install
cargo install wasm-pack
npm run build-rust
npm run server-release
```

# Web Gpu Requirements

The browser must support web-gpu else an error pop-up will be displayed. All chromium browsers should support web-gpu https://en.wikipedia.org/wiki/WebGPU#:~:text=Both%20Google%20Chrome%20and%20Firefox,of%20both%20WebGPU%20and%20WGSL. and in each case it should use native hardware for rendering.

# Development Information

Use `npm run server-debug` to run the server on local host with un-mininified javascript.
