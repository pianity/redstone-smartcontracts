import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { ContractData, CreateContract, FromSrcTxContractData } from '../../index';
export declare class DefaultCreateContract implements CreateContract {
    private readonly arweave;
    private readonly logger;
    constructor(arweave: Arweave);
    deploy(contractData: ContractData, useBundler?: boolean): Promise<string>;
    deployFromSourceTx(contractData: FromSrcTxContractData, useBundler?: boolean, srcTx?: Transaction): Promise<string>;
    private post;
}
//# sourceMappingURL=DefaultCreateContract.d.ts.map