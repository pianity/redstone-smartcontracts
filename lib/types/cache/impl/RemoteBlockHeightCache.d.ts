import { BlockHeightCacheResult, BlockHeightKey, BlockHeightSwCache } from '../index';
/**
 * A {@link BlockHeightSwCache} implementation that delegates all its methods
 * to remote endpoints.
 *
 * TODO: this could be further optimised - i.e. with the help of "level 1" memory cache
 * that would store max X elements - and would be backed up by the "level 2" remote cache.
 */
export declare class RemoteBlockHeightCache<V = any> implements BlockHeightSwCache<V> {
    private type;
    private baseURL;
    private axios;
    /**
     * @param type - id/type of the cache, that will allow to identify
     * it server side (e.g. "STATE" or "INTERACTIONS")
     * @param baseURL - the base url of the remote endpoint that serves
     * cache data (e.g. "http://localhost:3000")
     */
    constructor(type: string, baseURL: string);
    /**
     * GET '/last/:type/:key
     */
    getLast(key: string): Promise<BlockHeightCacheResult<V> | null>;
    /**
     * GET '/less-or-equal/:type/:key/:blockHeight
     */
    getLessOrEqual(key: string, blockHeight: number): Promise<BlockHeightCacheResult<V> | null>;
    /**
     * TODO: data should "flushed" in batches...
     * PUT '/:type/:key/:blockHeight' {data: value}
     */
    put({ cacheKey, blockHeight }: BlockHeightKey, value: V): Promise<void>;
    /**
     * GET '/contains/:type/:key'
     */
    contains(key: string): Promise<boolean>;
    /**
     * GET '/:type/:key/:blockHeight'
     */
    get(key: string, blockHeight: number): Promise<BlockHeightCacheResult<V> | null>;
    flush(): Promise<void>;
}
//# sourceMappingURL=RemoteBlockHeightCache.d.ts.map