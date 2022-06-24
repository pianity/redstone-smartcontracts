import { DefinitionLoader, ExecutionContext, ExecutionContextModifier, ExecutorFactory, HandlerApi } from '../index';
export declare class Evolve implements ExecutionContextModifier {
    private readonly definitionLoader;
    private readonly executorFactory;
    private readonly logger;
    constructor(definitionLoader: DefinitionLoader, executorFactory: ExecutorFactory<HandlerApi<unknown>>);
    modify<State>(state: State, executionContext: ExecutionContext<State, HandlerApi<State>>): Promise<ExecutionContext<State, HandlerApi<State>>>;
    static evolvedSrcTxId(state: unknown): string | undefined;
}
//# sourceMappingURL=Evolve.d.ts.map