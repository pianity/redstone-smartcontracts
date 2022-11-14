import { SortKeyCacheResult } from '../cache/SortKeyCache';
import { ContractCallRecord } from '../core/ContractCallRecord';
import { InteractionResult } from '../core/modules/impl/HandlerExecutorFactory';
import { EvaluationOptions, EvalStateResult } from '../core/modules/StateEvaluator';
import { Warp } from '../core/Warp';
import { GQLNodeInterface } from '../legacy/gqlResult';
import { Contract, BenchmarkStats, SigningFunction, CurrentTx, WriteInteractionOptions, WriteInteractionResponse, InnerCallData } from './Contract';
import { Tags, ArTransfer, ArWallet } from './deploy/CreateContract';
import { SourceData } from './deploy/impl/SourceImpl';
/**
 * An implementation of {@link Contract} that is backwards compatible with current style
 * of writing SW contracts (ie. using the "handle" function).
 *
 * It requires {@link ExecutorFactory} that is using {@link HandlerApi} generic type.
 */
export declare class HandlerBasedContract<State, Err = unknown> implements Contract<State, Err> {
    private readonly _contractTxId;
    protected readonly warp: Warp;
    private readonly _parentContract;
    private readonly _innerCallData;
    private readonly logger;
    private _callStack;
    private _evaluationOptions;
    private readonly _innerWritesEvaluator;
    private readonly _callDepth;
    private _benchmarkStats;
    private readonly _arweaveWrapper;
    private _sorter;
    private _rootSortKey;
    /**
     * wallet connected to this contract
     */
    protected signer?: SigningFunction;
    constructor(_contractTxId: string, warp: Warp, _parentContract?: Contract, _innerCallData?: InnerCallData);
    readState(sortKeyOrBlockHeight?: string | number, currentTx?: CurrentTx[], interactions?: GQLNodeInterface[]): Promise<SortKeyCacheResult<EvalStateResult<State, Err>>>;
    viewState<Input, View>(input: Input, tags?: Tags, transfer?: ArTransfer): Promise<InteractionResult<State, View, Err>>;
    viewStateForTx<Input, View>(input: Input, interactionTx: GQLNodeInterface): Promise<InteractionResult<State, View, Err>>;
    dryWrite<Input>(input: Input, caller?: string, tags?: Tags, transfer?: ArTransfer): Promise<InteractionResult<State, unknown, Err>>;
    dryWriteFromTx<Input>(input: Input, transaction: GQLNodeInterface, currentTx?: CurrentTx[]): Promise<InteractionResult<State, unknown, Err>>;
    writeInteraction<Input>(input: Input, options?: WriteInteractionOptions): Promise<WriteInteractionResponse<Err> | null>;
    private bundleInteraction;
    private createInteraction;
    txId(): string;
    getCallStack(): ContractCallRecord;
    connect(signer: ArWallet | SigningFunction): Contract<State, Err>;
    setEvaluationOptions(options: Partial<EvaluationOptions>): Contract<State, Err>;
    private waitForConfirmation;
    private createExecutionContext;
    private getToSortKey;
    private createExecutionContextFromTx;
    private maybeResetRootContract;
    private callContract;
    private callContractForTx;
    private evalInteraction;
    parent(): Contract | null;
    callDepth(): number;
    evaluationOptions(): EvaluationOptions;
    lastReadStateStats(): BenchmarkStats;
    stateHash(state: State): string;
    syncState(externalUrl: string, params?: any): Promise<Contract>;
    evolve(newSrcTxId: string, options?: WriteInteractionOptions): Promise<WriteInteractionResponse<Err> | null>;
    save(sourceData: SourceData): Promise<any>;
    get rootSortKey(): string;
}
//# sourceMappingURL=HandlerBasedContract.d.ts.map