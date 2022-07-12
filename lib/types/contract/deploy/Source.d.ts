import { ArWallet, SigningFunction, SourceData } from '../..';
export interface Source {
    /**
     * allows to post contract source on Arweave
     * @param contractSource - contract source...
     */
    save(contractSource: SourceData, signer?: ArWallet | SigningFunction, useBundler?: boolean): Promise<string | null>;
}
//# sourceMappingURL=Source.d.ts.map