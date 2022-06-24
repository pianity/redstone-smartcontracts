import { ArweaveWrapper, ContractDefinition, ContractSource, DefinitionLoader, WarpCache } from '../../../index';
import Arweave from 'arweave';
export declare class ContractDefinitionLoader implements DefinitionLoader {
    private readonly arweave;
    protected readonly cache?: WarpCache<string, ContractDefinition<unknown>>;
    private readonly logger;
    protected arweaveWrapper: ArweaveWrapper;
    constructor(arweave: Arweave, cache?: WarpCache<string, ContractDefinition<unknown>>);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    private evalInitialState;
}
//# sourceMappingURL=ContractDefinitionLoader.d.ts.map