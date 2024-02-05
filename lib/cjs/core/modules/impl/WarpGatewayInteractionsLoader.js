"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpGatewayInteractionsLoader = exports.SourceType = void 0;
const Benchmark_1 = require("../../../logging/Benchmark");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
require("warp-isomorphic");
const utils_1 = require("../../../utils/utils");
const HandlerExecutorFactory_1 = require("./HandlerExecutorFactory");
var SourceType;
(function (SourceType) {
    SourceType["ARWEAVE"] = "arweave";
    SourceType["WARP_SEQUENCER"] = "redstone-sequencer";
    SourceType["BOTH"] = "both";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
/**
 * The aim of this implementation of the {@link InteractionsLoader} is to make use of
 * Warp Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * endpoint and retrieve contracts' interactions.
 *
 * Optionally - it is possible to pass:
 * 1. {@link ConfirmationStatus.confirmed} flag - to receive only confirmed interactions - ie. interactions with
 * enough confirmations, whose existence is confirmed by at least 3 Arweave peers.
 * 2. {@link ConfirmationStatus.notCorrupted} flag - to receive both already confirmed and not yet confirmed (ie. latest)
 * interactions.
 * 3. {@link SourceType} - to receive interactions based on their origin ({@link SourceType.ARWEAVE} or {@link SourceType.WARP_SEQUENCER}).
 * If not set, by default {@link SourceType.BOTH} is set.
 *
 * Passing no flag is the "backwards compatible" mode (ie. it will behave like the original Arweave GQL gateway endpoint).
 * Note that this may result in returning corrupted and/or forked interactions
 * - read more {@link https://github.com/warp-contracts/redstone-sw-gateway#corrupted-transactions}.
 */
class WarpGatewayInteractionsLoader {
    constructor(confirmationStatus = null, source = SourceType.BOTH) {
        this.confirmationStatus = confirmationStatus;
        this.source = source;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('WarpGatewayInteractionsLoader');
        Object.assign(this, confirmationStatus);
        this.source = source;
    }
    async load(contractId, fromSortKey, toSortKey, evaluationOptions, signal) {
        var _a;
        this.logger.debug('Loading interactions: for ', { contractId, fromSortKey, toSortKey });
        const originalFromSortKey = fromSortKey;
        const interactions = [];
        let page = 0;
        let limit = 0;
        let items = 0;
        const pagesPerBatch = (evaluationOptions === null || evaluationOptions === void 0 ? void 0 : evaluationOptions.transactionsPagesPerBatch) || Number.MAX_SAFE_INTEGER;
        this.logger.debug('Pages per batch:', pagesPerBatch);
        const effectiveSourceType = evaluationOptions ? evaluationOptions.sourceType : this.source;
        const benchmarkTotalTime = Benchmark_1.Benchmark.measure();
        const baseUrl = (0, utils_1.stripTrailingSlash)(this._warp.gwUrl());
        do {
            const benchmarkRequestTime = Benchmark_1.Benchmark.measure();
            if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                throw new HandlerExecutorFactory_1.AbortError(`Abort signal in ${WarpGatewayInteractionsLoader.name}`);
            }
            const url = `${baseUrl}/gateway/v3/interactions-sort-key`;
            page++;
            const response = await (0, utils_1.getJsonResponse)(fetch(`${url}?${new URLSearchParams({
                contractId: contractId,
                ...(this._warp.whoAmI ? { client: this._warp.whoAmI } : ''),
                ...(fromSortKey ? { from: fromSortKey } : ''),
                ...(toSortKey ? { to: toSortKey } : ''),
                fromSdk: 'true',
                ...(this.confirmationStatus && this.confirmationStatus.confirmed
                    ? { confirmationStatus: 'confirmed' }
                    : ''),
                ...(this.confirmationStatus && this.confirmationStatus.notCorrupted
                    ? { confirmationStatus: 'not_corrupted' }
                    : ''),
                ...(effectiveSourceType == SourceType.BOTH ? '' : { source: effectiveSourceType })
            })}`));
            this.logger.debug(`Loading interactions: page ${page} loaded in ${benchmarkRequestTime.elapsed()}`);
            interactions.push(...response.interactions);
            limit = response.paging.limit;
            items = response.paging.items;
            fromSortKey = (_a = interactions[interactions.length - 1]) === null || _a === void 0 ? void 0 : _a.sortKey;
            this.logger.debug(`Loaded interactions length: ${interactions.length}, from: ${fromSortKey}, to: ${toSortKey}`);
        } while (items == limit && page < pagesPerBatch); // note: items < limit means that we're on the last page
        this.logger.debug('All loaded interactions:', {
            from: originalFromSortKey,
            to: toSortKey,
            loaded: interactions.length,
            time: benchmarkTotalTime.elapsed()
        });
        return interactions;
    }
    type() {
        return 'warp';
    }
    clearCache() {
        // noop
    }
    set warp(warp) {
        this._warp = warp;
    }
}
exports.WarpGatewayInteractionsLoader = WarpGatewayInteractionsLoader;
//# sourceMappingURL=WarpGatewayInteractionsLoader.js.map