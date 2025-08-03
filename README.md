# wasm-cf-boilerplate

Boilerplate for deploying C++ via WASM to a Cloudflare Worker.

## Usage

0. It is assumed you have Emscripten (and NodeJS) installed. If not, you can use the [EmSDK](https://github.com/emscripten-core/emsdk), or if you're on a Mac with [Homebrew](https://brew.sh), simply `brew install emscripten`.
1. Ensure the `toolchainFile` path in [`CMakePresets.json`](CMakePresets.json) points to your Emscripten install (edit if necessary).
2. From the repo root, install the Cloudflare tooling (i.e. [`wrangler`](https://developers.cloudflare.com/workers/wrangler/)) with `npm install`.
3. If you're using VSCode, this repo is configured to work with [CMakeTools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools) + [clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) + [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) + [WASM DWARF Debug](https://marketplace.visualstudio.com/items?itemName=ms-vscode.wasm-dwarf-debugging), and you can use their associated commands to build, execute & debug (P.S. Disable the regular C++ intellisense extension).
4. If you're not on VSCode, you can still use the CMake presets:
  - Configure: `cmake --preset debug-wasm-demo`
  - Build: `cmake --build --preset debug-wasm-demo`
  - Replace `debug-wasm-demo` with `release-wasm-demo` to build for release.
  - Perhaps consult the [Emscripten docs](https://emscripten.org/docs/tools_reference/index.html) to set up debug tooling.

## Notes

- [`harness.js`](src/harness.js) is the entrypoint for running/debugging under NodeJS:
  - You can run it with `cd src && node harness.js`.
  - This will only work for __Debug__ builds (i.e. using the `debug-wasm-demo` CMake preset), as it compiles with `-sENVIRONMENT=node,worker`.
- [`worker.js`](src/worker.js) is the entrypoint for running under Cloudflare's local dev env:
  - You can run it with `npx wrangler dev`.
  - This will only work for __Release__ builds (i.e. using the `release-wasm-demo` CMake preset), as it compiles with `-sENVIRONMENT=worker`.
- Deployment to Cloudflare can be done using the regular `npx wrangler deploy`, but update [`wrangler.jsonc`](wrangler.jsonc) accordingly.
- This has only been tried on Mac. Patches welcome for any other OS!