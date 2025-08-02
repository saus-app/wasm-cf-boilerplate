class CfKvMock {
    keys;
    values;
    logger;

    constructor (logger = () => {}) {
        this.keys = new Set();
        this.values = new Map();
        this.logger = logger;
    }

    async get (key) {
        const value = this.values.get(key) ?? "";
        this.logger("get <-", key , '=', value);
        return value;
    }

    async put (key, value, options) {
        this.logger("put ->", key, '=', value, options);
        this.keys.add(key);
        this.keys = new Set(Array.from(this.keys).sort());
        this.values.set(key, value);
    }
};

export {
    CfKvMock
};