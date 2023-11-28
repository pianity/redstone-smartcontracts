"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelDbCache = void 0;
const SortKeyCache_1 = require("../SortKeyCache");
const level_1 = require("level");
const memory_level_1 = require("memory-level");
const LoggerFactory_1 = require("../../logging/LoggerFactory");
/**
 * The LevelDB is a lexicographically sorted key-value database - so it's ideal for this use case
 * - as it simplifies cache look-ups (e.g. lastly stored value or value "lower-or-equal" than given sortKey).
 * The cache for contracts are implemented as sub-levels - https://www.npmjs.com/package/level#sublevel--dbsublevelname-options.
 *
 * The default location for the node.js cache is ./cache/warp.
 * The default name for the browser IndexedDB cache is warp-cache
 *
 * In order to reduce the cache size, the oldest entries are automatically pruned.
 */
class ClientValueWrapper {
    constructor(value, tomb = false) {
        this.value = value;
        this.tomb = tomb;
    }
}
class LevelDbCache {
    // Lazy initialization upon first access
    get db() {
        if (!this._db) {
            if (this.cacheOptions.inMemory) {
                this._db = new memory_level_1.MemoryLevel(this.subLevelOptions);
            }
            else {
                if (!this.cacheOptions.dbLocation) {
                    throw new Error('LevelDb cache configuration error - no db location specified');
                }
                const dbLocation = this.cacheOptions.dbLocation;
                this.logger.info(`Using location ${dbLocation}`);
                this._db = new level_1.Level(dbLocation, this.subLevelOptions);
            }
        }
        return this._db;
    }
    constructor(cacheOptions) {
        this.cacheOptions = cacheOptions;
        this.ongoingTransactionMark = '$$warp-internal-transaction$$';
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('LevelDbCache');
        this.subLevelSeparator = cacheOptions.subLevelSeparator || '!';
        this.subLevelOptions = {
            valueEncoding: 'json',
            separator: this.subLevelSeparator
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async get(cacheKey, returnDeepCopy) {
        this.validateKey(cacheKey.key);
        const contractCache = this.db.sublevel(cacheKey.key, this.subLevelOptions);
        // manually opening to fix https://github.com/Level/level/issues/221
        await contractCache.open();
        const subLevelValue = await this.getValueFromLevel(cacheKey.sortKey, contractCache);
        if (subLevelValue) {
            return new SortKeyCache_1.SortKeyCacheResult(cacheKey.sortKey, subLevelValue);
        }
        return null;
    }
    async getLast(key) {
        const contractCache = this.db.sublevel(key, this.subLevelOptions);
        // manually opening to fix https://github.com/Level/level/issues/221
        await contractCache.open();
        const keys = await contractCache.keys({ reverse: true, limit: 1 }).all();
        if (keys.length) {
            const subLevelValue = await this.getValueFromLevel(keys[0], contractCache);
            if (subLevelValue) {
                return new SortKeyCache_1.SortKeyCacheResult(keys[0], subLevelValue);
            }
        }
        return null;
    }
    async getLessOrEqual(key, sortKey) {
        const contractCache = this.db.sublevel(key, this.subLevelOptions);
        // manually opening to fix https://github.com/Level/level/issues/221
        await contractCache.open();
        const keys = await contractCache.keys({ reverse: true, lte: sortKey, limit: 1 }).all();
        if (keys.length) {
            const subLevelValue = await this.getValueFromLevel(keys[0], contractCache);
            if (subLevelValue != null) {
                return new SortKeyCache_1.SortKeyCacheResult(keys[0], subLevelValue);
            }
        }
        return null;
    }
    async getValueFromLevel(key, level) {
        try {
            const wrappedValue = await level.get(key);
            if (wrappedValue && wrappedValue.tomb === undefined && wrappedValue.value === undefined) {
                return wrappedValue;
            }
            if (wrappedValue && wrappedValue.tomb === false && wrappedValue.value != null) {
                return wrappedValue.value;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            if (e.code != 'LEVEL_NOT_FOUND') {
                throw e;
            }
        }
        return null;
    }
    async put(stateCacheKey, value) {
        await this.setClientValue(stateCacheKey, new ClientValueWrapper(value));
    }
    /**
     * Delete operation under the hood is a write operation with setting tomb flag to true.
     * The idea behind is based on Cassandra Tombstone
     * https://www.instaclustr.com/support/documentation/cassandra/using-cassandra/managing-tombstones-in-cassandra/
     * There is a couple of benefits to this approach:
     * This allows to use kv storage range operations with ease.
     * The value will not be accessible only to the next interactions. Interactions reading state for lower sortKey will be able to access it.
     * Revert operation for rollback is much easier to implement
     */
    async del(cacheKey) {
        await this.setClientValue(cacheKey, new ClientValueWrapper(null, true));
    }
    async setClientValue(stateCacheKey, valueWrapper) {
        this.validateKey(stateCacheKey.key);
        const contractCache = this.db.sublevel(stateCacheKey.key, this.subLevelOptions);
        // manually opening to fix https://github.com/Level/level/issues/221
        await contractCache.open();
        await contractCache.put(stateCacheKey.sortKey, valueWrapper);
        if (this._rollbackBatch) {
            this._rollbackBatch.del(stateCacheKey.sortKey, { sublevel: contractCache });
        }
    }
    async delete(key) {
        const contractCache = this.db.sublevel(key, this.subLevelOptions);
        await contractCache.open();
        await contractCache.clear();
    }
    async batch(opStack) {
        for (const op of opStack) {
            if (op.type === 'put') {
                await this.put(op.key, op.value);
            }
            else if (op.type === 'del') {
                await this.delete(op.key);
            }
        }
    }
    async open() {
        await this.db.open();
    }
    async close() {
        if (this._db) {
            await this._db.close();
        }
    }
    async begin() {
        await this.initRollbackBatch();
    }
    async rollback() {
        if (this._rollbackBatch) {
            this._rollbackBatch.del(this.ongoingTransactionMark);
            await this._rollbackBatch.write();
            await this._rollbackBatch.close();
        }
        this._rollbackBatch = null;
    }
    async initRollbackBatch() {
        if (this._rollbackBatch == null) {
            await this.checkPreviousTransactionFinished();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await this.db.put(this.ongoingTransactionMark, 'ongoing');
            this._rollbackBatch = this.db.batch();
        }
        return this._rollbackBatch;
    }
    async checkPreviousTransactionFinished() {
        let transactionMarkValue;
        try {
            transactionMarkValue = await this.db.get(this.ongoingTransactionMark);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            if (e.code != 'LEVEL_NOT_FOUND') {
                throw e;
            }
        }
        if (transactionMarkValue == 'ongoing') {
            throw new Error(`Database seems to be in inconsistent state. The previous transaction has not finished.`);
        }
    }
    async commit() {
        if (this._rollbackBatch) {
            await this._rollbackBatch.clear();
            await this.db.del(this.ongoingTransactionMark);
            await this._rollbackBatch.close();
        }
        this._rollbackBatch = null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async dump() {
        const result = await this.db.iterator().all();
        return result;
    }
    // TODO: this implementation is sub-optimal
    // the lastSortKey should be probably memoized during "put"
    async getLastSortKey() {
        let lastSortKey = '';
        await this.db.open();
        const keys = await this.db.keys().all();
        for (const joinedKey of keys) {
            // default joined key format used by sub-levels:
            // <separator><contract_tx_id (43 chars)><separator><sort_key>
            const sortKey = joinedKey.split(this.subLevelSeparator)[1];
            if (sortKey.localeCompare(lastSortKey) > 0) {
                lastSortKey = sortKey;
            }
        }
        return lastSortKey == '' ? null : lastSortKey;
    }
    async keys(sortKey, options) {
        return Array.from((await this.kvMap(sortKey, options)).keys());
    }
    validateKey(key) {
        if (key.includes(this.ongoingTransactionMark)) {
            throw new Error(`Validation error: Key ${key} for internal use only`);
        }
        if (key.includes(this.subLevelSeparator)) {
            throw new Error(`Validation error: key ${key} contains db separator ${this.subLevelSeparator}`);
        }
    }
    extractOriginalKey(joinedKey) {
        return joinedKey.split(this.subLevelSeparator)[1];
    }
    extractSortKey(joinedKey) {
        return joinedKey.split(this.subLevelSeparator)[2];
    }
    async kvMap(sortKey, options) {
        const result = new Map();
        const allKeys = (await this.db.keys(this.levelRangeOptions(options)).all())
            .filter((k) => k != this.ongoingTransactionMark)
            .filter((k) => !sortKey || this.extractSortKey(k).localeCompare(sortKey) <= 0)
            .map((k) => this.extractOriginalKey(k));
        for (const k of allKeys) {
            const lastValue = await this.getLessOrEqual(k, sortKey);
            if (lastValue) {
                result.set(k, lastValue.cachedValue);
            }
        }
        if (options === null || options === void 0 ? void 0 : options.limit) {
            const limitedResult = new Map();
            for (const item of Array.from(result.entries()).slice(0, options.limit)) {
                limitedResult.set(item[0], item[1]);
            }
            return limitedResult;
        }
        return result;
    }
    levelRangeOptions(options) {
        const rangeOptions = {
            reverse: options === null || options === void 0 ? void 0 : options.reverse
        };
        if (options === null || options === void 0 ? void 0 : options.gte) {
            rangeOptions.gte = this.subLevelSeparator + options.gte;
        }
        if (options === null || options === void 0 ? void 0 : options.lt) {
            rangeOptions.lt = this.subLevelSeparator + options.lt;
        }
        return rangeOptions;
    }
    storage() {
        return this.db;
    }
    async getNumEntries() {
        const keys = await this.db.keys().all();
        return keys.length;
    }
    /**
     Let's assume that given contract cache contains these sortKeys: [a, b, c, d, e, f]
     Let's assume entriesStored = 2
     After pruning, the cache should be left with these keys: [e,f].
  
     const entries = await contractCache.keys({ reverse: true, limit: entriesStored }).all();
     This would return in this case entries [f, e] (notice the "reverse: true").
  
     await contractCache.clear({ lt: entries[entries.length - 1] });
     This effectively means: await contractCache.clear({ lt: e });
     -> hence the entries [a,b,c,d] are removed and left are the [e,f]
    */
    async prune(entriesStored = 5) {
        if (!entriesStored || entriesStored <= 0) {
            entriesStored = 1;
        }
        const contracts = await this.allKeys();
        for (let i = 0; i < contracts.length; i++) {
            const contractCache = this.db.sublevel(contracts[i], this.subLevelOptions);
            // manually opening to fix https://github.com/Level/level/issues/221
            await contractCache.open();
            // Get keys that will be left, just to get the last one of them
            const entries = await contractCache.keys({ reverse: true, limit: entriesStored }).all();
            if (!entries || entries.length < entriesStored) {
                continue;
            }
            await contractCache.clear({ lt: entries[entries.length - 1] });
            await contractCache.close();
        }
        return null;
    }
    async allKeys() {
        return (await this.db.keys().all())
            .filter((k) => k != this.ongoingTransactionMark)
            .map((k) => this.extractOriginalKey(k));
    }
}
exports.LevelDbCache = LevelDbCache;
//# sourceMappingURL=LevelDbCache.js.map