"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInteractionState = void 0;
const SortKeyCache_1 = require("../../cache/SortKeyCache");
const SimpleLRUCache_1 = require("../../common/SimpleLRUCache");
class ContractInteractionState {
    constructor(_warp) {
        this._warp = _warp;
        this._json = new Map();
        this._initialJson = new Map();
        this._kv = new Map();
    }
    has(contractTx, sortKey) {
        var _a;
        return ((_a = this._json.get(contractTx)) === null || _a === void 0 ? void 0 : _a.has(sortKey)) || false;
    }
    get(contractTxId, sortKey) {
        var _a;
        return ((_a = this._json.get(contractTxId)) === null || _a === void 0 ? void 0 : _a.get(sortKey)) || null;
    }
    getLessOrEqual(contractTxId, sortKey) {
        const states = this._json.get(contractTxId);
        if (states != null && states.size() > 0) {
            let keys = states.keys();
            if (sortKey) {
                keys = keys.filter((k) => k.localeCompare(sortKey) <= 0);
            }
            keys = keys.sort((a, b) => a.localeCompare(b));
            const resultSortKey = keys[keys.length - 1];
            if (states.get(resultSortKey)) {
                return new SortKeyCache_1.SortKeyCacheResult(resultSortKey, states.get(resultSortKey));
            }
        }
        return null;
    }
    async getKV(contractTxId, cacheKey) {
        var _a;
        if (this._kv.has(contractTxId)) {
            return ((_a = (await this._kv.get(contractTxId).get(cacheKey))) === null || _a === void 0 ? void 0 : _a.cachedValue) || null;
        }
        return null;
    }
    async delKV(contractTxId, cacheKey) {
        if (this._kv.has(contractTxId)) {
            await this._kv.get(contractTxId).del(cacheKey);
        }
    }
    getKvKeys(contractTxId, sortKey, options) {
        const storage = this._warp.kvStorageFactory(contractTxId);
        return storage.keys(sortKey, options);
    }
    getKvRange(contractTxId, sortKey, options) {
        const storage = this._warp.kvStorageFactory(contractTxId);
        return storage.kvMap(sortKey, options);
    }
    async commit(interaction, forceStore = false) {
        if (interaction.dry) {
            await this.rollbackKVs();
            return this.reset();
        }
        try {
            const latestState = new Map();
            this._json.forEach((val, k) => {
                const state = this.getLessOrEqual(k, interaction.sortKey);
                if (state != null) {
                    latestState.set(k, state.cachedValue);
                }
            });
            await this.doStoreJson(latestState, interaction, forceStore);
            await this.commitKVs();
        }
        finally {
            this.reset();
        }
    }
    async commitKV() {
        await this.commitKVs();
        this._kv.clear();
    }
    async rollback(interaction, forceStateStoreToCache) {
        try {
            await this.doStoreJson(this._initialJson, interaction, forceStateStoreToCache);
            await this.rollbackKVs();
        }
        finally {
            this.reset();
        }
    }
    setInitial(contractTxId, state, sortKey) {
        // think twice here.
        this._initialJson.set(contractTxId, state);
        this.update(contractTxId, state, sortKey);
    }
    update(contractTxId, state, sortKey) {
        if (!this._json.has(contractTxId)) {
            const cache = new SimpleLRUCache_1.SimpleLRUCache(10);
            this._json.set(contractTxId, cache);
        }
        this._json.get(contractTxId).set(sortKey, state);
    }
    async updateKV(contractTxId, key, value) {
        await (await this.getOrInitKvStorage(contractTxId)).put(key, value);
    }
    async getOrInitKvStorage(contractTxId) {
        if (this._kv.has(contractTxId)) {
            return this._kv.get(contractTxId);
        }
        const storage = this._warp.kvStorageFactory(contractTxId);
        this._kv.set(contractTxId, storage);
        await storage.open();
        return storage;
    }
    reset() {
        this._json.clear();
        this._initialJson.clear();
        this._kv.clear();
    }
    async doStoreJson(states, interaction, forceStore = false) {
        if (states.size > 1 || forceStore) {
            for (const [k, v] of states) {
                await this._warp.stateEvaluator.putInCache(k, interaction, v);
            }
        }
    }
    async rollbackKVs() {
        for (const storage of this._kv.values()) {
            try {
                await storage.rollback();
            }
            finally {
                await storage.close();
            }
        }
    }
    async commitKVs() {
        for (const storage of this._kv.values()) {
            try {
                await storage.commit();
            }
            finally {
                await storage.close();
            }
        }
    }
}
exports.ContractInteractionState = ContractInteractionState;
//# sourceMappingURL=ContractInteractionState.js.map