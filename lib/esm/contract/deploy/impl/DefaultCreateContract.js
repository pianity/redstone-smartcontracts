/* eslint-disable */
import { SmartWeaveTags } from '../../../core/index';
import { LoggerFactory } from '../../../logging/index';
import { SourceImpl } from '../../index';
export class DefaultCreateContract {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = LoggerFactory.INST.create('DefaultCreateContract');
        this.deployFromSourceTx = this.deployFromSourceTx.bind(this);
    }
    async deploy(contractData, useBundler = false) {
        const { wallet, initState, tags, transfer, data } = contractData;
        const source = new SourceImpl(this.arweave);
        const srcTx = await source.save(contractData, wallet, useBundler);
        this.logger.debug('Creating new contract');
        return await this.deployFromSourceTx({
            srcTxId: srcTx.id,
            wallet,
            initState,
            tags,
            transfer,
            data
        }, useBundler, srcTx);
    }
    async deployFromSourceTx(contractData, useBundler = false, srcTx = null) {
        this.logger.debug('Creating new contract from src tx');
        const { wallet, srcTxId, initState, tags, transfer, data } = contractData;
        let contractTX = await this.arweave.createTransaction({ data: (data === null || data === void 0 ? void 0 : data.body) || initState }, wallet);
        if (+(transfer === null || transfer === void 0 ? void 0 : transfer.winstonQty) > 0 && transfer.target.length) {
            this.logger.debug('Creating additional transaction with AR transfer', transfer);
            contractTX = await this.arweave.createTransaction({
                data: (data === null || data === void 0 ? void 0 : data.body) || initState,
                target: transfer.target,
                quantity: transfer.winstonQty
            }, wallet);
        }
        if (tags === null || tags === void 0 ? void 0 : tags.length) {
            for (const tag of tags) {
                contractTX.addTag(tag.name.toString(), tag.value.toString());
            }
        }
        contractTX.addTag(SmartWeaveTags.APP_NAME, 'SmartWeaveContract');
        contractTX.addTag(SmartWeaveTags.APP_VERSION, '0.3.0');
        contractTX.addTag(SmartWeaveTags.CONTRACT_SRC_TX_ID, srcTxId);
        contractTX.addTag(SmartWeaveTags.SDK, 'RedStone');
        if (data) {
            contractTX.addTag(SmartWeaveTags.CONTENT_TYPE, data['Content-Type']);
            contractTX.addTag(SmartWeaveTags.INIT_STATE, initState);
        }
        else {
            contractTX.addTag(SmartWeaveTags.CONTENT_TYPE, 'application/json');
        }
        await this.arweave.transactions.sign(contractTX, wallet);
        let responseOk;
        if (useBundler) {
            const result = await this.post(contractTX, srcTx);
            this.logger.debug(result);
            responseOk = true;
        }
        else {
            const response = await this.arweave.transactions.post(contractTX);
            responseOk = response.status === 200 || response.status === 208;
        }
        if (responseOk) {
            return contractTX.id;
        }
        else {
            throw new Error(`Unable to write Contract`);
        }
    }
    async post(contractTx, srcTx = null) {
        let body = {
            contractTx
        };
        if (srcTx) {
            body = {
                ...body,
                srcTx
            };
        }
        const response = await fetch(`https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts/deploy`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error(`Error while posting contract ${response.statusText}`);
        }
    }
}
//# sourceMappingURL=DefaultCreateContract.js.map