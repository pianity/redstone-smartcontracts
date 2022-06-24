import { ContractDefinition, EvalStateResult, ExecutionContext, InteractionData, InteractionResult, SmartWeaveGlobal } from '../../../../index';
import { AbstractContractHandler } from './AbstractContractHandler';
import { Context, Isolate, Reference } from 'isolated-vm';
export declare class IvmHandlerApi<State> extends AbstractContractHandler<State> {
    private readonly ivm;
    constructor(swGlobal: SmartWeaveGlobal, contractDefinition: ContractDefinition<State>, ivm: {
        isolate: Isolate;
        context: Context;
        sandbox: Reference<Record<number | string | symbol, any>>;
        contract: Reference;
    });
    handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    initState(state: State): void;
    dispose(): Promise<void>;
}
//# sourceMappingURL=IvmHandlerApi.d.ts.map