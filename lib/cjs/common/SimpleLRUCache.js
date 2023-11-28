"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleLRUCache = void 0;
class SimpleLRUCache {
    constructor(capacity) {
        this.cache = new Map();
        this.capacity = capacity || 10;
    }
    has(key) {
        return this.cache.has(key);
    }
    size() {
        return this.cache.size;
    }
    get(key) {
        if (!this.cache.has(key))
            return null;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val);
        return val;
    }
    set(key, value) {
        this.cache.delete(key);
        if (this.cache.size === this.capacity) {
            this.cache.delete(this.cache.keys().next().value);
            this.cache.set(key, value);
        }
        else {
            this.cache.set(key, value);
        }
    }
    keys() {
        return Array.from(this.cache.keys());
    }
}
exports.SimpleLRUCache = SimpleLRUCache;
//# sourceMappingURL=SimpleLRUCache.js.map