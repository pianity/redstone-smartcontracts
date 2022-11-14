import Arweave from 'arweave';
import { SortKeyCacheResult } from '../../../cache/SortKeyCache';
import { CurrentTx } from '../../../contract/Contract';
import { ExecutionContext } from '../../../core/ExecutionContext';
import { ExecutionContextModifier } from '../../../core/ExecutionContextModifier';
import { GQLNodeInterface } from '../../../legacy/gqlResult';
import { StateEvaluator, EvalStateResult } from '../StateEvaluator';
import { HandlerApi } from './HandlerExecutorFactory';
/**
 * This class contains the base functionality of evaluating the contracts state - according
 * to the SmartWeave protocol.
 * Marked as abstract - as without help of any cache - the evaluation in real-life applications
 * would be really slow - so using this class without any caching ({@link CacheableStateEvaluator})
 * mechanism built on top makes no sense.
 */
export declare abstract class DefaultStateEvaluator implements StateEvaluator {
    protected readonly arweave: Arweave;
    private readonly executionContextModifiers;
    private readonly logger;
    private readonly tagsParser;
    protected constructor(arweave: Arweave, executionContextModifiers?: ExecutionContextModifier[]);
    eval<State, Err = unknown>(executionContext: ExecutionContext<State, HandlerApi<State>, Err>, currentTx: CurrentTx[]): Promise<SortKeyCacheResult<EvalStateResult<State, Err>>>;
    protected doReadState<State, Err>(missingInteractions: GQLNodeInterface[], baseState: EvalStateResult<State, Err>, executionContext: ExecutionContext<State, HandlerApi<State>>, currentTx: CurrentTx[]): Promise<SortKeyCacheResult<EvalStateResult<State, Err>>>;
    private verifyVrf;
    private logResult;
    private parseInput;
    abstract latestAvailableState<State, Err = unknown>(contractTxId: string, sortKey?: string): Promise<SortKeyCacheResult<EvalStateResult<State, Err>> | null>;
    abstract onContractCall<State, Err = unknown>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State, Err>): Promise<void>;
    abstract onInternalWriteStateUpdate<State, Err = unknown>(transaction: GQLNodeInterface, contractTxId: string, state: EvalStateResult<State, Err>): Promise<void>;
    abstract onStateEvaluated<State, Err = unknown>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State, Err>): Promise<void>;
    abstract onStateUpdate<State, Err = unknown>(transaction: GQLNodeInterface, executionContext: ExecutionContext<State>, state: EvalStateResult<State, Err>, force?: boolean): Promise<void>;
    abstract putInCache<State, Err = unknown>(contractTxId: string, transaction: GQLNodeInterface, state: EvalStateResult<State, Err>): Promise<void>;
    abstract syncState(contractTxId: string, sortKey: string, state: any, validity: any): Promise<void>;
    abstract dumpCache(): Promise<any>;
    abstract internalWriteState<State, Err>(contractTxId: string, sortKey: string): Promise<SortKeyCacheResult<EvalStateResult<State, Err>> | null>;
    abstract hasContractCached(contractTxId: string): Promise<boolean>;
    abstract lastCachedSortKey(): Promise<string | null>;
    abstract allCachedContracts(): Promise<string[]>;
}
//# sourceMappingURL=DefaultStateEvaluator.d.ts.map