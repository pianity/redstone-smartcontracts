import { EvaluationOptions, GQLEdgeInterface } from '../../index';
import { CustomError } from '../../utils/index';
export declare type InteractionsLoaderErrorKind = 'BadGatewayResponse500' | 'BadGatewayResponse504' | 'BadGatewayResponse';
export declare class InteractionsLoaderError extends CustomError<InteractionsLoaderErrorKind> {
}
/**
 * Implementors of this interface add functionality of loading contract's interaction transactions.
 * These transactions are then used to evaluate contract's state to a required block height.
 *
 * Note: InteractionsLoaders are not responsible for sorting interaction transactions!
 */
export interface InteractionsLoader {
    load(contractId: string, fromBlockHeight: number, toBlockHeight: number, evaluationOptions?: EvaluationOptions, upToTransactionId?: string): Promise<GQLEdgeInterface[]>;
}
//# sourceMappingURL=InteractionsLoader.d.ts.map