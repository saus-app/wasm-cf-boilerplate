import http from 'http';
import Adapter from './Adapter.js';
import { CfKvMock } from './Mock.js';

const cwd = process.cwd();
const importPathModule = `file://${cwd}/gen/WasmDemo.js`;
const hostname = "localhost";
const hostport = 8787;

await (async () => {
    const base = `http://${hostname}:${hostport}`;
    const adapterOptions = {
        cfkv: new CfKvMock(console.log),
    };

    async function handleRequest (url, body) {
        const {default: SausModule} = await import(`${importPathModule}?imported=${Date.now()}`);
        const adapter = await Adapter.make(SausModule, adapterOptions);
        console.log("->", url, body.length, body);
        const res = await adapter.handleRequest(url, body);
        console.log("<-", res);
        return res;
    }

    async function readBody (req) {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", () => resolve(body));
            req.on("error", () => reject());
        });
    }

    const server = http.createServer(async (req, res) => {
        const url = `${base}${req.url}`;
        const body = await readBody(req);
        const out = await handleRequest(url, body);
        res.statusCode = out.statusCode;
        res.setHeaders(out.headers);
        res.end(new Uint8Array(out.content));
    });

    server.listen(hostport, hostname, () => {
        console.log(`Harness running @ ${base}/`);
    });
})();
