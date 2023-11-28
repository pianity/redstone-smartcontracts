"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortKeyCacheResult = exports.CacheKey = void 0;
class CacheKey {
    constructor(key, sortKey) {
        this.key = key;
        this.sortKey = sortKey;
    }
}
exports.CacheKey = CacheKey;
class SortKeyCacheResult {
    constructor(sortKey, cachedValue) {
        this.sortKey = sortKey;
        this.cachedValue = cachedValue;
    }
}
exports.SortKeyCacheResult = SortKeyCacheResult;
//# sourceMappingURL=SortKeyCache.js.map