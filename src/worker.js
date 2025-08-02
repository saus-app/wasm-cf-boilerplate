import Adapter from './Adapter.js';
import { CfKvMock } from './Mock.js';
import WasmModule from './gen/WasmDemo.js';
import WasmBinary from './gen/WasmDemo.wasm';

export default {
    /**
     * @param {Request} request
     * @param {*} env
     * @param {*} ctx
     * @returns {Response}
     */
    async fetch(request, env, ctx) {
        // Bootstrap the WASM instance:
        const adapterOptions = {
            async instantiateWasm (imports, onSuccess) {
                const instance = await WebAssembly.instantiate(WasmBinary, imports);
                onSuccess(instance);
                return instance.exports;
            },
            // You can replace this with a real Cloudflare KV binding from `env`:
            cfkv: new CfKvMock(console.log),
        };
        // Await WASM initialisation and request body:
        const [adapter, body] = await Promise.all([
            Adapter.make(WasmModule, adapterOptions),
            request.text(),
        ]);
        // Handle request:
        const res = await adapter.handleRequest(request.url, body);
        return new Response(new Uint8Array(res.content), {
            status: res.statusCode,
            headers: res.headers,
        });
    },
};
