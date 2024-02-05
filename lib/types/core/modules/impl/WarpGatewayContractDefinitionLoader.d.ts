import Arweave from 'arweave';
import { GW_TYPE } from '../InteractionsLoader';
import { ContractDefinition, ContractSource } from '../../../core/ContractDefinition';
import { DefinitionLoader } from '../DefinitionLoader';
import { Warp, WarpEnvironment } from '../../Warp';
/**
 * Makes use of Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on Warp Gateway - it fallbacks to default implementation
 * in {@link ArweaveContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
export declare class WarpGatewayContractDefinitionLoader implements DefinitionLoader {
    private readonly rLogger;
    private contractDefinitionLoader;
    private arweaveWrapper;
    private readonly tagsParser;
    private _warp;
    constructor(arweave: Arweave, env: WarpEnvironment);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    type(): GW_TYPE;
    set warp(warp: Warp);
}
//# sourceMappingURL=WarpGatewayContractDefinitionLoader.d.ts.map