import { ContractDefinition, EvaluationOptions } from '../../index';
export interface ContractApi {
}
/**
 * An interface for all the factories that produce Warp contracts "executors" -
 * i.e. objects that are responsible for actually running the contract's code.
 */
export interface ExecutorFactory<Api> {
    create<State>(contractDefinition: ContractDefinition<State>, evaluationOptions: EvaluationOptions): Promise<Api>;
}
//# sourceMappingURL=ExecutorFactory.d.ts.map