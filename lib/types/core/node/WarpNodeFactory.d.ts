import Arweave from 'arweave';
import { ConfirmationStatus, Warp, WarpBuilder, WarpWebFactory } from '../index';
import { Knex } from 'knex';
/**
 * A {@link Warp} factory that can be safely used only in Node.js env.
 */
export declare class WarpNodeFactory extends WarpWebFactory {
    /**
     * Returns a fully configured, memcached {@link Warp} that is suitable for tests with ArLocal
     */
    static forTesting(arweave: Arweave): Warp;
    /**
     * Returns a fully configured {@link Warp} that is using file-based cache for {@link StateEvaluator} layer
     * and mem cache for the rest.
     *
     * @param cacheBasePath - path where cache files will be stored
     * @param maxStoredInMemoryBlockHeights - how many cache entries per contract will be stored in
     * the underneath mem-cache
     *
     */
    static fileCached(arweave: Arweave, cacheBasePath?: string, maxStoredInMemoryBlockHeights?: number): Warp;
    /**
     * Returns a preconfigured, fileCached {@link WarpBuilder}, that allows for customization of the Warp instance.
     * Use {@link WarpBuilder.build()} to finish the configuration.
     * @param cacheBasePath - see {@link fileCached.cacheBasePath}
     * @param maxStoredInMemoryBlockHeights - see {@link fileCached.maxStoredInMemoryBlockHeights}
     *
     */
    static fileCachedBased(arweave: Arweave, cacheBasePath?: string, maxStoredInMemoryBlockHeights?: number, confirmationStatus?: ConfirmationStatus): WarpBuilder;
    static knexCached(arweave: Arweave, dbConnection: Knex, maxStoredInMemoryBlockHeights?: number): Promise<Warp>;
    /**
     */
    static knexCachedBased(arweave: Arweave, dbConnection: Knex, maxStoredInMemoryBlockHeights?: number, confirmationStatus?: ConfirmationStatus): Promise<WarpBuilder>;
}
//# sourceMappingURL=WarpNodeFactory.d.ts.map