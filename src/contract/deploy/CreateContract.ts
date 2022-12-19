import { JWKInterface } from 'arweave/node/lib/wallet';
import { SignatureType } from '../../contract/Signature';
import { Source } from './Source';

export type Tags = { name: string; value: string }[];

export type ArWallet = JWKInterface | 'use_wallet';

export type ContractType = 'js' | 'wasm';

export type ArTransfer = {
  target: string;
  winstonQty: string;
};

export const emptyTransfer: ArTransfer = {
  target: '',
  winstonQty: '0'
};

export interface CommonContractData {
  wallet: ArWallet | SignatureType;
  initState: string | Buffer;
  tags?: Tags;
  transfer?: ArTransfer;
  data?: {
    'Content-Type': string;
    body: string | Uint8Array | ArrayBuffer;
  };
}

export interface ContractData extends CommonContractData {
  src: string | Buffer;
  wasmSrcCodeDir?: string;
  wasmGlueCode?: string;
}

export interface FromSrcTxContractData extends CommonContractData {
  srcTxId: string;
}

export interface ContractDeploy {
  contractTxId: string;
  srcTxId?: string;
}

export interface CreateContract extends Source {
  deploy(contractData: ContractData, disableBundling?: boolean): Promise<ContractDeploy>;

  deployFromSourceTx(contractData: FromSrcTxContractData, disableBundling?: boolean): Promise<ContractDeploy>;

  deployBundled(rawDataItem: Buffer): Promise<ContractDeploy>;
}
