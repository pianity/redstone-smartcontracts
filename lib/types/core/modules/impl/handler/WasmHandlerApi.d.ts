import { ContractDefinition, EvalStateResult, ExecutionContext, InteractionData, InteractionResult, SmartWeaveGlobal } from '../../../../index';
import { AbstractContractHandler } from './AbstractContractHandler';
export declare class WasmHandlerApi<State> extends AbstractContractHandler<State> {
    private readonly wasmExports;
    constructor(swGlobal: SmartWeaveGlobal, contractDefinition: ContractDefinition<State>, wasmExports: any);
    handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    initState(state: State): void;
    private doHandle;
    private doGetCurrentState;
}
//# sourceMappingURL=WasmHandlerApi.d.ts.map