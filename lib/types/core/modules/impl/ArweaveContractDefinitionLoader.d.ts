import Arweave from 'arweave';
import { ContractDefinition, ContractSource } from '../../../core/ContractDefinition';
import { ArweaveWrapper } from '../../../utils/ArweaveWrapper';
import { DefinitionLoader } from '../DefinitionLoader';
import { GW_TYPE } from '../InteractionsLoader';
import { Warp, WarpEnvironment } from '../../Warp';
export declare class ArweaveContractDefinitionLoader implements DefinitionLoader {
    private readonly arweave;
    private readonly env;
    private readonly logger;
    protected arweaveWrapper: ArweaveWrapper;
    private readonly tagsParser;
    constructor(arweave: Arweave, env: WarpEnvironment);
    load<State>(contractTxId: string, evolvedSrcTxId?: string): Promise<ContractDefinition<State>>;
    doLoad<State>(contractTxId: string, forcedSrcTxId?: string): Promise<ContractDefinition<State>>;
    loadContractSource(contractSrcTxId: string): Promise<ContractSource>;
    private evalInitialState;
    type(): GW_TYPE;
    set warp(warp: Warp);
}
//# sourceMappingURL=ArweaveContractDefinitionLoader.d.ts.map