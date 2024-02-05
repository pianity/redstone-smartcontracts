"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableContractDefinitionLoader = void 0;
const warp_isomorphic_1 = require("warp-isomorphic");
const ContractDefinition_1 = require("../../ContractDefinition");
const Benchmark_1 = require("../../../logging/Benchmark");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const SortKeyCache_1 = require("../../../cache/SortKeyCache");
const LevelDbCache_1 = require("../../../cache/impl/LevelDbCache");
/**
 * An implementation of {@link CacheableDefinitionLoader} that delegates loading contracts and caches the result.
 */
class CacheableContractDefinitionLoader {
    constructor(contractDefinitionLoader, env, cacheOptions) {
        this.contractDefinitionLoader = contractDefinitionLoader;
        this.env = env;
        this.rLogger = LoggerFactory_1.LoggerFactory.INST.create('CacheableContractDefinitionLoader');
        this.definitionCache = new LevelDbCache_1.LevelDbCache({
            ...cacheOptions,
            dbLocation: `${cacheOptions.dbLocation}/contracts`
        });
        // Separate cache for sources to minimize duplicates
        this.srcCache = new LevelDbCache_1.LevelDbCache({
            ...cacheOptions,
            dbLocation: `${cacheOptions.dbLocation}/source`
        });
    }
    async load(contractTxId, evolvedSrcTxId) {
        const result = await this.getFromCache(contractTxId, evolvedSrcTxId);
        if (result) {
            this.rLogger.debug('Hit from cache!', contractTxId, evolvedSrcTxId);
            // LevelDB serializes Buffer to an object with 'type' and 'data' fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (result.contractType == 'wasm' && result.srcBinary.data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result.srcBinary = warp_isomorphic_1.Buffer.from(result.srcBinary.data);
            }
            this.verifyEnv(result);
            return result;
        }
        const benchmark = Benchmark_1.Benchmark.measure();
        const contract = await this.contractDefinitionLoader.load(contractTxId, evolvedSrcTxId);
        this.rLogger.info(`Contract definition loaded in: ${benchmark.elapsed()}`);
        this.verifyEnv(contract);
        await this.putToCache(contractTxId, contract, evolvedSrcTxId);
        return contract;
    }
    async loadContractSource(contractSrcTxId) {
        return await this.contractDefinitionLoader.loadContractSource(contractSrcTxId);
    }
    type() {
        return this.contractDefinitionLoader.type();
    }
    setCache(cache) {
        this.definitionCache = cache;
    }
    setSrcCache(cacheSrc) {
        this.srcCache = cacheSrc;
    }
    getCache() {
        return this.definitionCache;
    }
    getSrcCache() {
        return this.srcCache;
    }
    verifyEnv(def) {
        if (def.testnet && this.env !== 'testnet') {
            throw new Error('Trying to use testnet contract in a non-testnet env. Use the "forTestnet" factory method.');
        }
        if (!def.testnet && this.env === 'testnet') {
            throw new Error('Trying to use non-testnet contract in a testnet env.');
        }
    }
    // Gets ContractDefinition and ContractSource from two caches and returns a combined structure
    async getFromCache(contractTxId, srcTxId) {
        const contract = (await this.definitionCache.get(new SortKeyCache_1.CacheKey(contractTxId, 'cd')));
        if (!contract) {
            return null;
        }
        const effectiveSrcTxId = srcTxId || contract.cachedValue.srcTxId;
        const src = await this.srcCache.get(new SortKeyCache_1.CacheKey(effectiveSrcTxId, 'src'));
        if (!src) {
            return null;
        }
        return { ...contract.cachedValue, ...src.cachedValue, srcTxId: effectiveSrcTxId };
    }
    // Divides ContractDefinition into entries in two caches to avoid duplicates
    async putToCache(contractTxId, value, srcTxId) {
        const src = new ContractDefinition_1.SrcCache(value);
        const contract = new ContractDefinition_1.ContractCache(value);
        await this.definitionCache.put({ key: contractTxId, sortKey: 'cd' }, contract);
        await this.srcCache.put({ key: srcTxId || contract.srcTxId, sortKey: 'src' }, src);
    }
    set warp(warp) {
        this.contractDefinitionLoader.warp = warp;
    }
}
exports.CacheableContractDefinitionLoader = CacheableContractDefinitionLoader;
//# sourceMappingURL=CacheableContractDefinitionLoader.js.map