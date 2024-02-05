"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpGatewayContractDefinitionLoader = void 0;
const ArweaveContractDefinitionLoader_1 = require("./ArweaveContractDefinitionLoader");
const warp_isomorphic_1 = require("warp-isomorphic");
const KnownTags_1 = require("../../KnownTags");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const ArweaveWrapper_1 = require("../../../utils/ArweaveWrapper");
const WasmSrc_1 = require("./wasm/WasmSrc");
const TagsParser_1 = require("./TagsParser");
const arweave_types_1 = require("../../../utils/types/arweave-types");
const utils_1 = require("../../../utils/utils");
/**
 * Makes use of Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * to load Contract Data.
 *
 * If the contract data is not available on Warp Gateway - it fallbacks to default implementation
 * in {@link ArweaveContractDefinitionLoader} - i.e. loads the definition from Arweave gateway.
 */
class WarpGatewayContractDefinitionLoader {
    constructor(arweave, env) {
        this.rLogger = LoggerFactory_1.LoggerFactory.INST.create('WarpGatewayContractDefinitionLoader');
        this.contractDefinitionLoader = new ArweaveContractDefinitionLoader_1.ArweaveContractDefinitionLoader(arweave, env);
        this.tagsParser = new TagsParser_1.TagsParser();
    }
    async load(contractTxId, evolvedSrcTxId) {
        try {
            const baseUrl = (0, utils_1.stripTrailingSlash)(this._warp.gwUrl());
            const result = await (0, utils_1.getJsonResponse)(fetch(`${baseUrl}/gateway/contract?txId=${contractTxId}${evolvedSrcTxId ? `&srcTxId=${evolvedSrcTxId}` : ''}`));
            if (result.srcBinary != null && !(result.srcBinary instanceof warp_isomorphic_1.Buffer)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                result.srcBinary = warp_isomorphic_1.Buffer.from(result.srcBinary.data);
            }
            if (result.srcBinary) {
                const wasmSrc = new WasmSrc_1.WasmSrc(result.srcBinary);
                result.srcBinary = wasmSrc.wasmBinary();
                let sourceTx;
                if (result.srcTx) {
                    sourceTx = new arweave_types_1.Transaction({ ...result.srcTx });
                }
                else {
                    sourceTx = await this.arweaveWrapper.tx(result.srcTxId);
                }
                const srcMetaData = JSON.parse(this.tagsParser.getTag(sourceTx, KnownTags_1.WARP_TAGS.WASM_META));
                result.metadata = srcMetaData;
            }
            result.contractType = result.src ? 'js' : 'wasm';
            return result;
        }
        catch (e) {
            this.rLogger.warn('Falling back to default contracts loader', e);
            return await this.contractDefinitionLoader.doLoad(contractTxId, evolvedSrcTxId);
        }
    }
    async loadContractSource(contractSrcTxId) {
        return await this.contractDefinitionLoader.loadContractSource(contractSrcTxId);
    }
    type() {
        return 'warp';
    }
    set warp(warp) {
        this._warp = warp;
        this.arweaveWrapper = new ArweaveWrapper_1.ArweaveWrapper(warp);
        this.contractDefinitionLoader.warp = warp;
    }
}
exports.WarpGatewayContractDefinitionLoader = WarpGatewayContractDefinitionLoader;
//# sourceMappingURL=WarpGatewayContractDefinitionLoader.js.map