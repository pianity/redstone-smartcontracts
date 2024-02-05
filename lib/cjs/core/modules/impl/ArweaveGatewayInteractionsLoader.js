"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArweaveGatewayInteractionsLoader = exports.bundledTxsFilter = void 0;
const KnownTags_1 = require("../../KnownTags");
const Benchmark_1 = require("../../../logging/Benchmark");
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const LexicographicalInteractionsSorter_1 = require("./LexicographicalInteractionsSorter");
const ArweaveGQLTxsFetcher_1 = require("./ArweaveGQLTxsFetcher");
const TagsParser_1 = require("./TagsParser");
const MAX_REQUEST = 100;
function bundledTxsFilter(tx) {
    var _a, _b;
    return !((_a = tx.node.parent) === null || _a === void 0 ? void 0 : _a.id) && !((_b = tx.node.bundledIn) === null || _b === void 0 ? void 0 : _b.id);
}
exports.bundledTxsFilter = bundledTxsFilter;
class ArweaveGatewayInteractionsLoader {
    constructor(arweave, environment) {
        this.arweave = arweave;
        this.environment = environment;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create('ArweaveGatewayInteractionsLoader');
        this.tagsParser = new TagsParser_1.TagsParser();
        this.sorter = new LexicographicalInteractionsSorter_1.LexicographicalInteractionsSorter(arweave);
    }
    async load(contractId, fromSortKey, toSortKey, evaluationOptions, signal) {
        this.logger.debug('Loading interactions for', { contractId, fromSortKey, toSortKey });
        const fromBlockHeight = this.sorter.extractBlockHeight(fromSortKey);
        let toBlockHeight = this.sorter.extractBlockHeight(toSortKey);
        const pagesPerBatch = (evaluationOptions === null || evaluationOptions === void 0 ? void 0 : evaluationOptions.transactionsPagesPerBatch) || Number.MAX_SAFE_INTEGER;
        this.logger.debug('Pages per batch', pagesPerBatch);
        const mainTransactionsQuery = {
            tags: [
                {
                    name: KnownTags_1.SMART_WEAVE_TAGS.APP_NAME,
                    values: ['SmartWeaveAction']
                },
                {
                    name: KnownTags_1.SMART_WEAVE_TAGS.CONTRACT_TX_ID,
                    values: [contractId]
                }
            ],
            blockFilter: {
                min: fromBlockHeight,
                max: toBlockHeight
            },
            first: MAX_REQUEST
        };
        const loadingBenchmark = Benchmark_1.Benchmark.measure();
        let interactions = (await this.arweaveTransactionQuery.transactions(mainTransactionsQuery, pagesPerBatch, signal)).filter(bundledTxsFilter);
        loadingBenchmark.stop();
        if ((evaluationOptions === null || evaluationOptions === void 0 ? void 0 : evaluationOptions.transactionsPagesPerBatch) && interactions.length > 0) {
            interactions = await this.sorter.sort(interactions);
            toBlockHeight = interactions[interactions.length - 1].node.block.height;
        }
        if (evaluationOptions.internalWrites) {
            const pagesPerBatchIw = (function () {
                if (evaluationOptions === null || evaluationOptions === void 0 ? void 0 : evaluationOptions.transactionsPagesPerBatch) {
                    if (interactions.length > 0) {
                        // note: the limit in this case is the block height of the last 'direct' interaction
                        return Number.MAX_SAFE_INTEGER;
                    }
                    else {
                        return evaluationOptions === null || evaluationOptions === void 0 ? void 0 : evaluationOptions.transactionsPagesPerBatch;
                    }
                }
                else {
                    return Number.MAX_SAFE_INTEGER;
                }
            })();
            const innerWritesVariables = {
                tags: [
                    {
                        name: KnownTags_1.WARP_TAGS.INTERACT_WRITE,
                        values: [contractId]
                    }
                ],
                blockFilter: {
                    min: fromBlockHeight,
                    max: toBlockHeight
                },
                first: MAX_REQUEST
            };
            const innerWritesInteractions = (await this.arweaveTransactionQuery.transactions(innerWritesVariables, pagesPerBatchIw, signal)).filter(bundledTxsFilter);
            this.logger.debug('Inner writes interactions length:', innerWritesInteractions.length);
            interactions = interactions.concat(innerWritesInteractions);
        }
        /**
         * Because the behaviour of the Arweave gateway in case of passing null to min/max block height
         * in the gql query params is unknown (https://discord.com/channels/908759493943394334/908766823342801007/983643012947144725)
         * - we're removing all the interactions, that have null block data.
         */
        interactions = interactions.filter((i) => i.node.block && i.node.block.id && i.node.block.height);
        // deduplicate any interactions that may have been provided twice
        const interactionMap = new Map();
        for (const interaction of interactions) {
            if (!interactionMap.has(interaction.node.id)) {
                interactionMap.set(interaction.node.id, interaction);
            }
        }
        const deduplicatedInteractions = Array.from(interactionMap.values());
        // note: this operation adds the "sortKey" to the interactions
        let sortedInteractions = await this.sorter.sort(deduplicatedInteractions);
        if (fromSortKey && toSortKey) {
            sortedInteractions = sortedInteractions.filter((i) => {
                return i.node.sortKey.localeCompare(fromSortKey) > 0 && i.node.sortKey.localeCompare(toSortKey) <= 0;
            });
        }
        else if (fromSortKey && !toSortKey) {
            sortedInteractions = sortedInteractions.filter((i) => {
                return i.node.sortKey.localeCompare(fromSortKey) > 0;
            });
        }
        else if (!fromSortKey && toSortKey) {
            sortedInteractions = sortedInteractions.filter((i) => {
                return i.node.sortKey.localeCompare(toSortKey) <= 0;
            });
        }
        this.logger.debug('All loaded interactions:', {
            from: fromSortKey,
            to: toSortKey,
            loaded: sortedInteractions.length,
            time: loadingBenchmark.elapsed()
        });
        const isLocalOrTestnetEnv = this.environment === 'local' || this.environment === 'testnet';
        const vrfPlugin = this._warp.maybeLoadPlugin('vrf');
        return sortedInteractions.map((i) => {
            const interaction = i.node;
            if (isLocalOrTestnetEnv) {
                if (this.tagsParser.hasVrfTag(interaction)) {
                    if (vrfPlugin) {
                        interaction.vrf = vrfPlugin.process().generateMockVrf(interaction.sortKey);
                    }
                    else {
                        this.logger.warn('Cannot generate mock vrf for interaction - no "warp-contracts-plugin-vrf" attached!');
                    }
                }
            }
            return interaction;
        });
    }
    type() {
        return 'arweave';
    }
    clearCache() {
        // noop
    }
    set warp(warp) {
        this.arweaveTransactionQuery = new ArweaveGQLTxsFetcher_1.ArweaveGQLTxsFetcher(warp);
        this._warp = warp;
    }
}
exports.ArweaveGatewayInteractionsLoader = ArweaveGatewayInteractionsLoader;
//# sourceMappingURL=ArweaveGatewayInteractionsLoader.js.map