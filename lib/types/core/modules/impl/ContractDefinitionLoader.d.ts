import Arweave from 'arweave';
import { ContractDefinition, ContractSource } from '../../../core/ContractDefinition';
import { ArweaveWrapper } from '../../../utils/ArweaveWrapper';
import { DefinitionLoader } from '../DefinitionLoader';
import { GW_TYPE } from '../InteractionsLoader';
export declare class ContractDefinitionLoader implements DefinitionLoader {
    private readonly arweave;
    private readonly logger;
    protected arweaveWrapper: ArweaveWrapper;
    constructor(arweave: Arweave);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    private evalInitialState;
    type(): GW_TYPE;
}
//# sourceMappingURL=ContractDefinitionLoader.d.ts.map