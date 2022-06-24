"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpGatewayContractDefinitionLoader = void 0;
const _warp_1 = require("../../../index");
const ContractDefinitionLoader_1 = require("./ContractDefinitionLoader");
require("redstone-isomorphic");
const WasmSrc_1 = require("./wasm/WasmSrc");
const transaction_1 = __importDefault(require("arweave/node/lib/transaction"));
/**
 * An extension to {@link ContractDefinitionLoader} that makes use of
 * Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on Warp Gateway - it fallbacks to default implementation
 * in {@link ContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
class WarpGatewayContractDefinitionLoader {
    constructor(baseUrl, arweave, cache) {
        this.baseUrl = baseUrl;
        this.rLogger = _warp_1.LoggerFactory.INST.create('WarpGatewayContractDefinitionLoader');
        this.baseUrl = (0, _warp_1.stripTrailingSlash)(baseUrl);
        this.contractDefinitionLoader = new ContractDefinitionLoader_1.ContractDefinitionLoader(arweave, cache);
        this.arweaveWrapper = new _warp_1.ArweaveWrapper(arweave);
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
                const wasmSrc = new WasmSrc_1.WasmSrc(result.srcBinary);
                result.srcBinary = wasmSrc.wasmBinary();
                let sourceTx;
                if (result.srcTx) {
                    sourceTx = new transaction_1.default({ ...result.srcTx });
                }
                else {
                    sourceTx = await this.arweaveWrapper.tx(result.srcTxId);
                }
                const srcMetaData = JSON.parse((0, _warp_1.getTag)(sourceTx, _warp_1.SmartWeaveTags.WASM_META));
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
exports.WarpGatewayContractDefinitionLoader = WarpGatewayContractDefinitionLoader;
//# sourceMappingURL=WarpGatewayContractDefinitionLoader.js.map