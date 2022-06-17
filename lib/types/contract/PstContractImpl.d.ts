import { BalanceResult, HandlerBasedContract, InteractionError, NoWalletError, PstContract, PstState, TransferInput } from './index';
import { Result } from 'neverthrow';
export declare class PstContractImpl extends HandlerBasedContract<PstState> implements PstContract {
    currentBalance(target: string): Promise<BalanceResult>;
    currentState(): Promise<PstState>;
    transfer(transfer: TransferInput): Promise<Result<string, InteractionError | NoWalletError>>;
}
//# sourceMappingURL=PstContractImpl.d.ts.map