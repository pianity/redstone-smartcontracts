import { BlockHeightCacheResult, Contract, ContractDefinition, EvalStateResult, EvaluationOptions, GQLEdgeInterface, Warp } from '../index';
import { NetworkInfoInterface } from 'arweave/node/network';
import { BlockData } from 'arweave/node/blocks';
/**
 * current execution context of the contract - contains all elements
 * that are required to call contract's code.
 * This has been created to prevent some operations from loading certain data (eg.
 * contract's definition - which is very time consuming) multiple times
 * (eg. multiple calls to "loadContract" in "interactRead" in the current version of the Arweave's smartweave.js).
 */
export declare type ExecutionContext<State, Api = unknown> = {
    /**
     * {@link Warp} client currently being used
     */
    warp: Warp;
    /**
     * {@link Contract} related to this execution context
     */
    contract: Contract<State>;
    /**
     * The full {@link ContractDefinition} of the {@link Contract}
     */
    contractDefinition: ContractDefinition<State>;
    /**
     * block height used for all operations - either requested block height or current network block height
     */
    blockHeight: number;
    /**
     * interaction sorted using either {@link LexicographicalInteractionsSorter} or {@link BlockHeightInteractionsSorter}
     * - crucial for proper and deterministic state evaluation
     */
    sortedInteractions: GQLEdgeInterface[];
    /**
     * evaluation options currently being used
     * TODO: this can be removed, as it should be accessible from the {@link Contract}
     */
    evaluationOptions: EvaluationOptions;
    /**
     * A handle to the contract's "handle" function - ie. main function of the given SWC - that actually
     * performs all the computation.
     */
    handler: Api;
    currentNetworkInfo?: NetworkInfoInterface;
    currentBlockData?: BlockData;
    caller?: string;
    cachedState?: BlockHeightCacheResult<EvalStateResult<State>>;
    containsInteractionsFromSequencer: boolean;
    upToTransactionId?: string;
};
//# sourceMappingURL=ExecutionContext.d.ts.map