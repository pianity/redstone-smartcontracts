import { Warp, WarpEnvironment } from '../../Warp';
import { SortKeyCache } from '../../../cache/SortKeyCache';
import { ContractCache, ContractDefinition, ContractSource, SrcCache } from '../../../core/ContractDefinition';
import { GQLTransaction } from '../../../legacy/gqlResult';
import { DefinitionLoader } from '../DefinitionLoader';
import { GW_TYPE } from '../InteractionsLoader';
export declare class ArweaveGatewayBundledContractDefinitionLoader implements DefinitionLoader {
    private readonly env;
    private arweaveWrapper;
    private arweaveTransactions;
    private readonly logger;
    constructor(env: WarpEnvironment);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    fetchContractTx(contractTxId: string): Promise<GQLTransaction | null>;
    private convertToWarpCompatibleContractTx;
    loadContractSource(srcTxId: string): Promise<ContractSource>;
    private contractSource;
    private evalInitialState;
    setCache(): void;
    setSrcCache(): void;
    getCache(): SortKeyCache<ContractCache<unknown>>;
    getSrcCache(): SortKeyCache<SrcCache>;
    type(): GW_TYPE;
    set warp(warp: Warp);
}
//# sourceMappingURL=ArweaveGatewayBundledContractDefinitionLoader.d.ts.map