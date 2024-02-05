import { GW_TYPE } from '../InteractionsLoader';
import { ContractCache, ContractDefinition, ContractSource, SrcCache } from '../../ContractDefinition';
import { CacheableDefinitionLoader, DefinitionLoader } from '../DefinitionLoader';
import { Warp, WarpEnvironment } from '../../Warp';
import { BasicSortKeyCache } from '../../../cache/BasicSortKeyCache';
import { CacheOptions } from '../../WarpFactory';
/**
 * An implementation of {@link CacheableDefinitionLoader} that delegates loading contracts and caches the result.
 */
export declare class CacheableContractDefinitionLoader implements CacheableDefinitionLoader {
    private readonly contractDefinitionLoader;
    private readonly env;
    private readonly rLogger;
    private definitionCache;
    private srcCache;
    constructor(contractDefinitionLoader: DefinitionLoader, env: WarpEnvironment, cacheOptions: CacheOptions);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    type(): GW_TYPE;
    setCache(cache: BasicSortKeyCache<ContractCache<unknown>>): void;
    setSrcCache(cacheSrc: BasicSortKeyCache<SrcCache>): void;
    getCache(): BasicSortKeyCache<ContractCache<unknown>>;
    getSrcCache(): BasicSortKeyCache<SrcCache>;
    private verifyEnv;
    private getFromCache;
    private putToCache;
    set warp(warp: Warp);
}
//# sourceMappingURL=CacheableContractDefinitionLoader.d.ts.map