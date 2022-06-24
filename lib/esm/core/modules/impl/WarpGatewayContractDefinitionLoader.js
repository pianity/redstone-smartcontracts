import { ArweaveWrapper, getTag, LoggerFactory, SmartWeaveTags, stripTrailingSlash } from '../../../index';
import { ContractDefinitionLoader } from './ContractDefinitionLoader';
import 'redstone-isomorphic';
import { WasmSrc } from './wasm/WasmSrc';
import Transaction from 'arweave/node/lib/transaction';
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on Warp Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
export class WarpGatewayContractDefinitionLoader {
    constructor(baseUrl, arweave, cache) {
        this.baseUrl = baseUrl;
        this.rLogger = LoggerFactory.INST.create('WarpGatewayContractDefinitionLoader');
        this.baseUrl = stripTrailingSlash(baseUrl);
        this.contractDefinitionLoader = new ContractDefinitionLoader(arweave, cache);
        this.arweaveWrapper = new ArweaveWrapper(arweave);
    }
    async load(contractTxId, evolvedSrcTxId) {
        return await this.contractDefinitionLoader.load(contractTxId, evolvedSrcTxId);
    }
    async doLoad(contractTxId, forcedSrcTxId) {
        try {
            const result = await fetch(`${this.baseUrl}/gateway/contract?txId=${contractTxId}${forcedSrcTxId ? `&srcTxId=${forcedSrcTxId}` : ''}`)
                .then((res) => {
                return res.ok ? res.json() : Promise.reject(res);
            })
                .catch((error) => {
                var _a, _b;
                if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                    this.rLogger.error(error.body.message);
                }
                throw new Error(`Unable to retrieve contract data. Warp gateway responded with status ${error.status}:${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
            });
            if (result.srcBinary != null && !(result.srcBinary instanceof Buffer)) {
                result.srcBinary = Buffer.from(result.srcBinary.data);
            }
            if (result.srcBinary) {
                const wasmSrc = new WasmSrc(result.srcBinary);
                result.srcBinary = wasmSrc.wasmBinary();
                let sourceTx;
                if (result.srcTx) {
                    sourceTx = new Transaction({ ...result.srcTx });
                }
                else {
                    sourceTx = await this.arweaveWrapper.tx(result.srcTxId);
                }
                const srcMetaData = JSON.parse(getTag(sourceTx, SmartWeaveTags.WASM_META));
                result.metadata = srcMetaData;
            }
            result.contractType = result.src ? 'js' : 'wasm';
            return result;
        }
        catch (e) {
            this.rLogger.warn('Falling back to default contracts loader', e);
            return await this.contractDefinitionLoader.doLoad(contractTxId, forcedSrcTxId);
        }
    }
    async loadContractSource(contractSrcTxId) {
        return await this.contractDefinitionLoader.loadContractSource(contractSrcTxId);
    }
}
//# sourceMappingURL=WarpGatewayContractDefinitionLoader.js.map