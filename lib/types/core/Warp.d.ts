import { DefinitionLoader, ExecutorFactory, HandlerApi, InteractionsLoader, InteractionsSorter, WarpBuilder, StateEvaluator } from './index';
import Arweave from 'arweave';
import { Contract, CreateContract, PstContract } from '../contract/index';
import { GQLNodeInterface } from '../legacy/index';
/**
 * The Warp "motherboard" ;-).
 * This is the base class that supplies the implementation of the SmartWeave protocol
 * Allows to plug-in different implementation of all the modules defined in the constructor.
 *
 * After being fully configured, it allows to "connect" to
 * contract and perform operations on them (see {@link Contract})
 */
export declare class Warp {
    readonly arweave: Arweave;
    readonly definitionLoader: DefinitionLoader;
    readonly interactionsLoader: InteractionsLoader;
    readonly interactionsSorter: InteractionsSorter;
    readonly executorFactory: ExecutorFactory<HandlerApi<unknown>>;
    readonly stateEvaluator: StateEvaluator;
    readonly useWarpGwInfo: boolean;
    readonly createContract: CreateContract;
    constructor(arweave: Arweave, definitionLoader: DefinitionLoader, interactionsLoader: InteractionsLoader, interactionsSorter: InteractionsSorter, executorFactory: ExecutorFactory<HandlerApi<unknown>>, stateEvaluator: StateEvaluator, useWarpGwInfo?: boolean);
    static builder(arweave: Arweave): WarpBuilder;
    /**
     * Allows to connect to any contract using its transaction id.
     * @param contractTxId
     * @param callingContract
     */
    contract<State>(contractTxId: string, callingContract?: Contract, callingInteraction?: GQLNodeInterface): Contract<State>;
    /**
     * Allows to connect to a contract that conforms to the Profit Sharing Token standard
     * @param contractTxId
     */
    pst(contractTxId: string): PstContract;
    flushCache(): Promise<void>;
}
//# sourceMappingURL=Warp.d.ts.map