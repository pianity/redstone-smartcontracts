"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArweaveGQLTxsFetcher = void 0;
const LoggerFactory_1 = require("../../../logging/LoggerFactory");
const ArweaveWrapper_1 = require("../../../utils/ArweaveWrapper");
const utils_1 = require("../../../utils/utils");
const Benchmark_1 = require("../../../logging/Benchmark");
const KnownTags_1 = require("../../KnownTags");
const HandlerExecutorFactory_1 = require("./HandlerExecutorFactory");
const TRANSACTIONS_QUERY = `query Transactions($tags: [TagFilter!]!, $blockFilter: BlockFilter!, $first: Int!, $after: String) {
    transactions(tags: $tags, block: $blockFilter, first: $first, sort: HEIGHT_ASC, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          owner { address }
          recipient
          tags {
            name
            value
          }
          block {
            height
            id
            timestamp
          }
          fee { winston }
          quantity { winston }
          parent { id }
          bundledIn { id }
        }
        cursor
      }
    }
  }`;
const TRANSACTION_QUERY = `query Transaction($id: ID!) {
  transaction(id: $id) {
          id
          owner { address, key }
          recipient
          tags {
            name
            value
          }
          block {
            height
            id
            timestamp
          }
          fee { winston, ar }
          quantity { winston, ar }
          bundledIn { id }
    			parent{ id }
          signature
        }
}`;
// this is a query for old/legacy bundler format
const TRANSACTION_QUERY_USING_TAG = `query Transactions($tags: [TagFilter!]!) {
  transactions(tags: $tags) {
      edges {
        node {
          id
          owner { address, key }
          recipient
          tags {
            name
            value
          }
          block {
            height
            id
            timestamp
          }
          fee { winston, ar }
          quantity { winston, ar }
          parent { id }
          bundledIn { id }
          signature
        }
      }
  }
}`;
const RETRY_TIMEOUT = 30 * 1000;
const MAX_REQUEST = 100;
/**
 * Query all transactions from arweave gateway
 */
class ArweaveGQLTxsFetcher {
    constructor(warp) {
        this.warp = warp;
        this.logger = LoggerFactory_1.LoggerFactory.INST.create(ArweaveGQLTxsFetcher.name);
        this.arweaveWrapper = new ArweaveWrapper_1.ArweaveWrapper(warp);
    }
    async transaction(transactionId) {
        const response = await this.fetch(TRANSACTION_QUERY, { id: transactionId });
        return response.transaction;
    }
    /**
     * Fetches transaction stored using legacy bundling format.
     */
    async transactionUsingUploaderTag(transactionId) {
        const txTag = {
            name: KnownTags_1.WARP_TAGS.UPLOADER_TX_ID,
            values: [transactionId]
        };
        const response = (await this.fetch(TRANSACTION_QUERY_USING_TAG, { tags: [txTag] }))
            .transactions;
        if (response.edges.length < 1) {
            throw new Error(`No interaction with tag ${KnownTags_1.WARP_TAGS.UPLOADER_TX_ID}:${transactionId}`);
        }
        return response.edges[0].node;
    }
    async transactions(variables, pagesPerBatch, signal) {
        let pageResult = (await this.fetch(TRANSACTIONS_QUERY, variables)).transactions;
        const edges = [...pageResult.edges];
        let pagesLoaded = 1;
        if (pagesLoaded >= pagesPerBatch) {
            return edges;
        }
        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
            throw new HandlerExecutorFactory_1.AbortError(`Abort signal in ${ArweaveGQLTxsFetcher.name}`);
        }
        while (pageResult.pageInfo.hasNextPage && pagesLoaded < pagesPerBatch) {
            if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                throw new HandlerExecutorFactory_1.AbortError(`Abort signal in ${ArweaveGQLTxsFetcher.name}`);
            }
            const cursor = pageResult.edges[MAX_REQUEST - 1].cursor;
            const newVariables = {
                ...variables,
                after: cursor
            };
            pageResult = (await this.fetch(TRANSACTIONS_QUERY, newVariables)).transactions;
            edges.push(...pageResult.edges);
            pagesLoaded++;
        }
        return edges;
    }
    async fetch(gqlQuery, variables) {
        const benchmark = Benchmark_1.Benchmark.measure();
        let response = await this.arweaveWrapper.gql(gqlQuery, variables);
        this.logger.debug('GQL page load:', benchmark.elapsed());
        while (response.status === 403) {
            this.logger.warn(`GQL rate limiting, waiting ${RETRY_TIMEOUT}ms before next try.`);
            await (0, utils_1.sleep)(RETRY_TIMEOUT);
            response = await this.arweaveWrapper.gql(gqlQuery, variables);
        }
        if (response.status !== 200) {
            throw new Error(`Unable to retrieve transactions. Arweave gateway responded with status ${response.status}.`);
        }
        if (response.data.errors) {
            this.logger.error(response.data.errors);
            throw new Error('Error while fetching arweave transactions');
        }
        return response.data.data;
    }
}
exports.ArweaveGQLTxsFetcher = ArweaveGQLTxsFetcher;
//# sourceMappingURL=ArweaveGQLTxsFetcher.js.map