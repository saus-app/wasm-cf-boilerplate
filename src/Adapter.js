class Adapter {
    factory;
    instance;

    constructor (factory) {
        this.factory = factory;
    }

    init (options) {
        const adapter = this;
        return new Promise(async (resolve, reject) => {
            const copy = {...options};
            copy.onAbort = () => { adapter.terminate(); };
            copy.onRuntimeInitialized = resolve;
            adapter.instance = await adapter.factory(copy);
        });
    }

    terminate () {
        delete this.factory;
        delete this.instance;
    }

    async handleRequest (url, body) {
        const res = {};
        await this.instance.doHandleRequest(url, body, res);
        return res;
    }

    static async make (module, options) {
        const adapter = new Adapter(module);
        await adapter.init(options);
        return adapter;
    }
}

export default Adapter;
