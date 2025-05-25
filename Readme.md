![Recording 2025-05-25 154926](https://github.com/user-attachments/assets/00636b25-4d2e-4320-a065-78e54c0be5e7)![Recording 2025-05-25 154926](https://github.com/user-attachments/assets/be29623c-59d7-4a6c-b9ba-9e7b84b66fd2)

# Introduction

Basic 2D cad editing functionality fully in a web browser with high performance. Uses rust web assembly for underlying data manipulation and web-gpu for visualisation.

Currently supports:

- Can select multiple objects
- Can rotate, flip, scale and offset blocks
- Can make edits on model level or on block level

Could be extended to support 3D visualisation.

# How to edit objects

![image](https://github.com/user-attachments/assets/953a28d0-7d6e-44d3-95b3-62b93d5b23db)

Click select and then block to enable to select tool to select blocks. The arrow keys can be used to move around. Selecting pan (the default command) will panning by clicking on the mouse.

Once an object is selected it can be roated by selecting the square at the top of the bounding box, dragging and dropping the box moves the object around and dragging the edges of the box changes the scale.

# Set-up for local hosting

- Needs the rust compiler to build wasm - https://www.rust-lang.org/tools/install
- Needs npm - https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

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
