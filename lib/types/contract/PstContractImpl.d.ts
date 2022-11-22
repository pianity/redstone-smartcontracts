import { WriteInteractionOptions, WriteInteractionResponse } from './Contract';
import { HandlerBasedContract } from './HandlerBasedContract';
import { PstState, PstContract, BalanceResult, TransferInput } from './PstContract';
interface BalanceInput {
    function: string;
    target: string;
}
export declare class PstContractImpl extends HandlerBasedContract<PstState, BalanceInput> implements PstContract {
    currentBalance(target: string): Promise<BalanceResult>;
    currentState(): Promise<PstState>;
    transfer(transfer: TransferInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse<unknown> | null>;
}
export {};
//# sourceMappingURL=PstContractImpl.d.ts.map