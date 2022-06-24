import { ContractDefinition, EvalStateResult, ExecutionContext, InteractionData, InteractionResult, SmartWeaveGlobal } from '../../../../index';
import { AbstractContractHandler } from './AbstractContractHandler';
export declare class JsHandlerApi<State> extends AbstractContractHandler<State> {
    private readonly contractFunction;
    constructor(swGlobal: SmartWeaveGlobal, contractDefinition: ContractDefinition<State>, contractFunction: Function);
    handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    initState(state: State): void;
}
//# sourceMappingURL=JsHandlerApi.d.ts.map