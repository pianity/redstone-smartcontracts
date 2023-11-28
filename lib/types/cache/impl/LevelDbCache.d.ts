import { BatchDBOp, CacheKey, SortKeyCache, SortKeyCacheResult } from '../SortKeyCache';
import { CacheOptions } from '../../core/WarpFactory';
import { SortKeyCacheRangeOptions } from '../SortKeyCacheRangeOptions';
export declare class LevelDbCache<V> implements SortKeyCache<V> {
    private readonly cacheOptions;
    private readonly ongoingTransactionMark;
    private readonly logger;
    private readonly subLevelSeparator;
    private readonly subLevelOptions;
    /**
     * not using the Level type, as it is not compatible with MemoryLevel (i.e. has more properties)
     * and there doesn't seem to be any public interface/abstract type for all Level implementations
     * (the AbstractLevel is not exported from the package...)
     */
    private _db;
    /**
     * Rollback batch is way of recovering kv storage state from before a failed interaction.
     * Currently, all operations performed during active transaction are directly saved to kv storage.
     * In case the transaction fails the changes will be reverted using the rollback batch.
     */
    private _rollbackBatch;
    private get db();
    constructor(cacheOptions: CacheOptions);
    get(cacheKey: CacheKey, returnDeepCopy?: boolean): Promise<SortKeyCacheResult<V> | null>;
    getLast(key: string): Promise<SortKeyCacheResult<V> | null>;
    getLessOrEqual(key: string, sortKey: string): Promise<SortKeyCacheResult<V> | null>;
    private getValueFromLevel;
    put(stateCacheKey: CacheKey, value: V): Promise<void>;
    /**
     * Delete operation under the hood is a write operation with setting tomb flag to true.
     * The idea behind is based on Cassandra Tombstone
     * https://www.instaclustr.com/support/documentation/cassandra/using-cassandra/managing-tombstones-in-cassandra/
     * There is a couple of benefits to this approach:
     * This allows to use kv storage range operations with ease.
     * The value will not be accessible only to the next interactions. Interactions reading state for lower sortKey will be able to access it.
     * Revert operation for rollback is much easier to implement
     */
    del(cacheKey: CacheKey): Promise<void>;
    private setClientValue;
    delete(key: string): Promise<void>;
    batch(opStack: BatchDBOp<V>[]): Promise<void>;
    open(): Promise<void>;
    close(): Promise<void>;
    begin(): Promise<void>;
    rollback(): Promise<void>;
    private initRollbackBatch;
    private checkPreviousTransactionFinished;
    commit(): Promise<void>;
    dump(): Promise<any>;
    getLastSortKey(): Promise<string | null>;
    keys(sortKey: string, options?: SortKeyCacheRangeOptions): Promise<string[]>;
    validateKey(key: string): void;
    extractOriginalKey(joinedKey: string): string;
    extractSortKey(joinedKey: string): string;
    kvMap(sortKey: string, options?: SortKeyCacheRangeOptions): Promise<Map<string, V>>;
    private levelRangeOptions;
    storage<S>(): S;
    getNumEntries(): Promise<number>;
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
    prune(entriesStored?: number): Promise<null>;
    private allKeys;
}
//# sourceMappingURL=LevelDbCache.d.ts.map