import { ContractDefinition, WarpCache } from '../../..';
import Arweave from 'arweave';
import { ContractDefinitionLoader } from './ContractDefinitionLoader';
import 'redstone-isomorphic';
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on Warp Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
export declare class WarpGatewayContractDefinitionLoader extends ContractDefinitionLoader {
    private readonly baseUrl;
    private readonly rLogger;
    constructor(baseUrl: string, arweave: Arweave, cache?: WarpCache<string, ContractDefinition<unknown>>);
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
}
//# sourceMappingURL=WarpGatewayContractDefinitionLoader.d.ts.map