import { BlockHeightCacheResult, BlockHeightKey, BlockHeightWarpCache } from '../index';
/**
 * A simple, in-memory cache implementation of the BlockHeightWarpCache
 */
export declare class MemBlockHeightWarpCache<V = any> implements BlockHeightWarpCache<V> {
    private maxStoredBlockHeights;
    private readonly logger;
    protected storage: {
        [key: string]: Map<number, V>;
    };
    constructor(maxStoredBlockHeights?: number);
    getLast(key: string): Promise<BlockHeightCacheResult<V> | null>;
    getLessOrEqual(key: string, blockHeight: number): Promise<BlockHeightCacheResult<V> | null>;
    put({ cacheKey, blockHeight }: BlockHeightKey, value: V): Promise<void>;
    protected putSync({ cacheKey, blockHeight }: BlockHeightKey, value: V): void;
    contains(key: string): Promise<boolean>;
    protected containsSync(key: string): boolean;
    get(key: string, blockHeight: number, returnDeepCopy?: boolean): Promise<BlockHeightCacheResult<V> | null>;
    flush(): Promise<void>;
}
//# sourceMappingURL=MemBlockHeightCache.d.ts.map