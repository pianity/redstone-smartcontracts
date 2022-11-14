import { SortKeyCacheResult } from '../../cache/SortKeyCache';
import { CurrentTx } from '../../contract/Contract';
import { ExecutionContext } from '../../core/ExecutionContext';
import { GQLNodeInterface } from '../../legacy/gqlResult';
/**
 * Implementors of this class are responsible for evaluating contract's state
 * - based on the {@link ExecutionContext}.
 */
export interface StateEvaluator {
    eval<State, Err>(executionContext: ExecutionContext<State, unknown, Err>, currentTx: CurrentTx[]): Promise<SortKeyCacheResult<EvalStateResult<State, Err>>>;
    /**
     * a hook that is called on each state update (i.e. after evaluating state for each interaction transaction)
     */
    onStateUpdate<State, Err>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State, Err>, force?: boolean): Promise<void>;
    /**
     * a hook that is called after state has been fully evaluated
     */
    onStateEvaluated<State, Err>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State, Err>): Promise<void>;
    /**
     * a hook that is called after performing internal write between contracts
     */
    onInternalWriteStateUpdate<State, Err>(transaction: GQLNodeInterface, contractTxId: string, state: EvalStateResult<State, Err>): Promise<void>;
    /**
     * a hook that is called before communicating with other contract.
     * note to myself: putting values into cache only "onContractCall" may degrade performance.
     * For example:
     * 1. block 722317 - contract A calls B
     * 2. block 722727 - contract A calls B
     * 3. block 722695 - contract B calls A
     * If we update cache only on contract call - for the last above call (B->A)
     * we would retrieve state cached for 722317. If there are any transactions
     * between 722317 and 722695 - the performance will be degraded.
     */
    onContractCall<State, Err>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State, Err>): Promise<void>;
    /**
     * loads the latest available state for given contract for given sortKey.
     */
    latestAvailableState<State, Err>(contractTxId: string, sortKey?: string): Promise<SortKeyCacheResult<EvalStateResult<State, Err>> | null>;
    putInCache<State, Err>(contractTxId: string, transaction: GQLNodeInterface, state: EvalStateResult<State, Err>): Promise<void>;
    /**
     * allows to syncState with an external state source (like Warp Distributed Execution Network)
     */
    syncState(contractTxId: string, sortKey: string, state: any, validity: any): Promise<void>;
    internalWriteState<State, Err = unknown>(contractTxId: string, sortKey: string): Promise<SortKeyCacheResult<EvalStateResult<State, Err>> | null>;
    dumpCache(): Promise<any>;
    hasContractCached(contractTxId: string): Promise<boolean>;
    lastCachedSortKey(): Promise<string | null>;
    allCachedContracts(): Promise<string[]>;
}
export declare class EvalStateResult<State, Err> {
    readonly state: State;
    readonly validity: Record<string, boolean>;
    readonly errors: Record<string, Err>;
    constructor(state: State, validity: Record<string, boolean>, errors: Record<string, Err>);
}
export declare class DefaultEvaluationOptions implements EvaluationOptions {
    ignoreExceptions: boolean;
    waitForConfirmation: boolean;
    updateCacheForEachInteraction: boolean;
    internalWrites: boolean;
    maxCallDepth: number;
    maxInteractionEvaluationTimeSeconds: number;
    stackTrace: {
        saveState: boolean;
    };
    bundlerUrl: string;
    gasLimit: number;
    useFastCopy: boolean;
    useVM2: boolean;
    allowUnsafeClient: boolean;
    allowBigInt: boolean;
    walletBalanceUrl: string;
    mineArLocalBlocks: boolean;
    throwOnInternalWriteError: boolean;
}
export interface EvaluationOptions {
    ignoreExceptions: boolean;
    waitForConfirmation: boolean;
    updateCacheForEachInteraction: boolean;
    internalWrites: boolean;
    maxCallDepth: number;
    maxInteractionEvaluationTimeSeconds: number;
    stackTrace: {
        saveState: boolean;
    };
    bundlerUrl: string;
    gasLimit: number;
    useFastCopy: boolean;
    useVM2: boolean;
    allowUnsafeClient: boolean;
    allowBigInt: boolean;
    walletBalanceUrl: string;
    mineArLocalBlocks: boolean;
    throwOnInternalWriteError: boolean;
}
//# sourceMappingURL=StateEvaluator.d.ts.map